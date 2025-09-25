import { PDFDocument } from 'pdf-lib';
import { promises as fs } from 'fs';

interface IFileState {
  process(context: PolyglotFile): Promise<void>;
}

class InitialState implements IFileState {
  public async process(context: PolyglotFile): Promise<void> {
    const pdfBytes = await fs.readFile(context.pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pdfBytesUncorrected = await pdfDoc.save({ useObjectStreams: false });
    context.pdfString = Buffer.from(pdfBytesUncorrected).toString('latin1');
    context.setState(new CorrectOffsetsState());
  }
}

class CorrectOffsetsState implements IFileState {
  public async process(context: PolyglotFile): Promise<void> {
    const prefix = '<!--\n';
    const prefixLength = Buffer.from(prefix, 'utf8').length;
    const { pdfString } = context;

    const startxrefRegex = /startxref\s*(\d+)/;
    const match = pdfString.match(startxrefRegex);
    if (!match || !match[1]) {
      throw new Error('Could not find startxref in the PDF.');
    }
    const originalXrefOffset = parseInt(match[1], 10);
    const xrefAndTrailerString = pdfString.substring(originalXrefOffset);
    const lines = xrefAndTrailerString.split(/\r?\n/);
    const newLines: string[] = [];
    let inXrefEntries = false;

    for (const line of lines) {
      if (line.trim().startsWith('trailer')) {
        inXrefEntries = false;
      }
      if (line.trim() === 'xref') {
        inXrefEntries = true;
        newLines.push(line);
        continue;
      }

      if (inXrefEntries) {
        const entryMatch = line.match(/^(\d{10}) (\d{5}) (n|f)/);
        if (entryMatch && entryMatch[1]) {
          const originalOffset = parseInt(entryMatch[1], 10);
          const newOffset = originalOffset === 0 ? 0 : originalOffset + prefixLength;
          newLines.push(`${newOffset.toString().padStart(10, '0')} ${entryMatch[2]} ${entryMatch[3]} `);
        } else {
          newLines.push(line);
        }
      } else {
        newLines.push(line);
      }
    }

    const correctedXrefAndTrailerString = newLines.join('\n');
    let correctedPdfString = pdfString.substring(0, originalXrefOffset) + correctedXrefAndTrailerString;
    const newXrefOffset = originalXrefOffset + prefixLength;
    correctedPdfString = correctedPdfString.replace(/startxref\s*\d+/, `startxref\n${newXrefOffset}`);
    context.pdfString = correctedPdfString;
    context.setState(new AssembleFileState());
  }
}

class AssembleFileState implements IFileState {
  public async process(context: PolyglotFile): Promise<void> {
    const prefix = Buffer.from('<!--\n', 'utf8');
    const suffix = Buffer.from('\n-->', 'utf8');
    const pdfBuffer = Buffer.from(context.pdfString, 'latin1');
    const htmlBuffer = Buffer.from(context.htmlString, 'utf8');
    context.finalBuffer = Buffer.concat([prefix, pdfBuffer, suffix, htmlBuffer]);
    context.setState(new FinalState());
  }
}

class FinalState implements IFileState {
  public async process(context: PolyglotFile): Promise<void> {
    await fs.writeFile(context.outputPath, context.finalBuffer);
  }
}

class PolyglotFile {
  public pdfPath: string;
  public htmlString: string;
  public outputPath: string;
  public pdfString: string = '';
  public finalBuffer: Buffer = Buffer.alloc(0);
  private state: IFileState;

  constructor(pdfPath: string, htmlString: string, outputPath: string) {
    this.pdfPath = pdfPath;
    this.htmlString = htmlString;
    this.outputPath = outputPath;
    this.state = new InitialState();
  }

  public setState(state: IFileState): void {
    this.state = state;
  }

  public async build(): Promise<void> {
    while (this.state) {
      await this.state.process(this);
      if (this.state instanceof FinalState) {
          await this.state.process(this);
          break;
      }
    }
  }
}



/**
 * This function creates a polyglot file that is both a valid PDF and a valid HTML file.
 * It is inspired by https://github.com/angea/pocorgtfo
 * @param pdfPath The path to the input PDF file.
 * @param htmlString The HTML content to be embedded in the file.
 * @param outputPath The path to the output polyglot file.
 */
export async function createPolyglotPdfHtml(pdfPath: string, htmlString: string, outputPath: string) {
  const polyglotFile = new PolyglotFile(pdfPath, htmlString, outputPath);
  await polyglotFile.build();
}