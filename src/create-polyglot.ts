import { PDFDocument } from 'pdf-lib';
import { promises as fs } from 'fs';

interface PolyglotInput {
    pdfPath: string;
    htmlString: string;
    outputPath: string;
}

class PolyglotBuilder {
    private readonly inputs: PolyglotInput;
    
    private rawPdfBuffer!: Buffer;
    private pdfHeader!: string;
    private pdfContent!: string;
    private originalXrefOffset!: number;

    private prefixBuffer!: Buffer;
    private middleBuffer!: Buffer;
    private suffixBuffer!: Buffer;
    
    constructor(inputs: PolyglotInput) {
        this.inputs = inputs;
    }
    
    public async build(): Promise<void> {
        await this.loadAndParsePdf();
        this.preparePolyglotStructure();
        const correctedPdfContent = this.createCorrectedPdfContent();
        const finalBuffer = this.assembleFinalBuffer(correctedPdfContent);
        await this.writeFile(finalBuffer);
    }

    /**
     * Step 1: Loads the PDF, saves it without object streams to ensure a predictable structure,
     * and parses out its essential components.
     */
    private async loadAndParsePdf(): Promise<void> {
        const pdfBytes = await fs.readFile(this.inputs.pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });
        
        // Saving without object streams makes xref table manipulation easier.
        this.rawPdfBuffer = Buffer.from(await pdfDoc.save({ useObjectStreams: false }));
        const pdfString = this.rawPdfBuffer.toString('latin1');
        
        const headerMatch = pdfString.match(/^%PDF-\d\.\d\s*/);
        if (!headerMatch) {
            throw new Error('Could not find a valid PDF header.');
        }
        this.pdfHeader = headerMatch[0];
        
        const contentStartIndex = this.pdfHeader.length;
        this.pdfContent = pdfString.substring(contentStartIndex);

        const startxrefMatch = pdfString.match(/startxref\s*(\d+)/);
        if (!startxrefMatch?.[1]) {
            throw new Error('Could not find startxref in the PDF.');
        }
        this.originalXrefOffset = parseInt(startxrefMatch[1], 10);
    }
    
    /**
     * Step 2: Prepares the buffer components that will wrap the PDF content
     * to form the polyglot structure.
     */
    private preparePolyglotStructure(): void {
        const commentStart = Buffer.from('<!--\n', 'utf8');
        const commentEnd = Buffer.from('\n-->', 'utf8');
        const pdfHeader = Buffer.from(this.pdfHeader, 'latin1');
        const htmlContent = Buffer.from(`\n${this.inputs.htmlString}\n`, 'utf8');

        this.prefixBuffer = Buffer.concat([commentStart, pdfHeader, commentEnd]);
        this.middleBuffer = Buffer.concat([htmlContent, commentStart]);
        this.suffixBuffer = commentEnd;
    }

    /**
     * Step 3: Recalculates the byte offsets in the PDF's cross-reference (xref) table
     * to account for the new content inserted into the file.
     * @returns A buffer containing the PDF content with corrected offsets.
     */
    private createCorrectedPdfContent(): Buffer {
        const injectionOffset = this.prefixBuffer.length + this.middleBuffer.length - this.pdfHeader.length;
        
        // Isolate the xref table and trailer
        const xrefAndTrailerString = this.pdfContent.substring(this.originalXrefOffset - this.pdfHeader.length);
        
        const correctedLines: string[] = [];
        const lines = xrefAndTrailerString.split(/\r?\n/);
        let inXrefEntries = false;

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('trailer')) {
                inXrefEntries = false;
            } else if (trimmedLine === 'xref') {
                inXrefEntries = true;
            }

            if (inXrefEntries) {
                // This regex captures an xref entry: e.g., "0000000015 00000 n "
                const entryMatch = line.match(/^(\d{10}) (\d{5}) (n|f)/);
                if (entryMatch && entryMatch[1]) {
                    const originalOffset = parseInt(entryMatch[1], 10);
                    // Object 0 is always at offset 0 and should not be changed.
                    const newOffset = originalOffset === 0 ? 0 : originalOffset + injectionOffset;
                    correctedLines.push(`${newOffset.toString().padStart(10, '0')} ${entryMatch[2]} ${entryMatch[3]} `);
                    continue;
                }
            }
            correctedLines.push(line);
        }

        const correctedXrefAndTrailer = correctedLines.join('\n');
        
        // Update the startxref value in the trailer to point to the new xref table location.
        const newXrefOffset = this.originalXrefOffset + injectionOffset;
        const finalXrefAndTrailer = correctedXrefAndTrailer.replace(
            /startxref\s*\d+/, 
            `startxref\n${newXrefOffset}`
        );

        const originalContentBody = this.pdfContent.substring(0, this.originalXrefOffset - this.pdfHeader.length);
        
        return Buffer.from(originalContentBody + finalXrefAndTrailer, 'latin1');
    }

    /**
     * Step 4: Assembles the final polyglot file from all its constituent buffers.
     * @param correctedPdfContent The PDF content with updated offsets.
     * @returns The final assembled buffer.
     */
    private assembleFinalBuffer(correctedPdfContent: Buffer): Buffer {
        return Buffer.concat([
            this.prefixBuffer,
            this.middleBuffer,
            correctedPdfContent,
            this.suffixBuffer,
        ]);
    }

    /**
     * Step 5: Writes the final buffer to the specified output path.
     * @param finalBuffer The buffer to write to disk.
     */
    private async writeFile(finalBuffer: Buffer): Promise<void> {
        await fs.writeFile(this.inputs.outputPath, finalBuffer);
    }
}


/**
 * This function creates a polyglot file that is both a valid PDF and a valid HTML file.
 * It is inspired by https://github.com/angea/pocorgtfo
 *
 * @param pdfPath The path to the input PDF file.
 * @param htmlString The HTML content to be embedded in the file.
 * @param outputPath The path to the output polyglot file.
 */
export async function createPolyglot(pdfPath: string, htmlString: string, outputPath: string): Promise<void> {
    const builder = new PolyglotBuilder({ pdfPath, htmlString, outputPath });
    await builder.build();
}