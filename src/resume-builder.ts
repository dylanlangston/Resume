import { mkdir, readFile, writeFile } from "fs/promises";
import puppeteer from "puppeteer";
import { render } from "resumed";
import { render as renderHtml, renderMarkdown } from "jsonresume-theme-local";
import { AFRelationship, PDFDocument } from "pdf-lib";
import type { AxeResults } from "axe-core";
import * as resume from "./resume/resume.json" assert { type: "json" };
// @ts-ignore
import { render as professional } from "jsonresume-theme-professional"
import { suppressErrors } from "./suppress-errors";
import { createPolyglot } from "./createPolyglot";
import { Configuration } from "./config";

class ResumeBuilder {
    public axeResults!: AxeResults;
    private html: string = "";
    private professionalHtml: string = "";
    private markdown: string = "";
    private htmlCombinedMarkdown: string = "";

    public async build() {
        await this.setupDirectories();
        await this.generateSourceFiles();
        await this.generatePdfs();
        await this.addPdfMetadata();
        await this.createPolyglotFile();
    }

    private async setupDirectories() {
        await mkdir(Configuration.OUT_DIR).catch(() => {});
    }

    private async generateSourceFiles() {
        this.html = await render(resume, { render: renderHtml });
        this.professionalHtml = await suppressErrors(() => render(resume, { render: professional }));
        this.markdown = await render(resume, { render: renderMarkdown });
        this.htmlCombinedMarkdown = `<!--\n${this.markdown}\n-->${this.html}`;

        await writeFile(Configuration.MD_PATH, this.markdown);
        await writeFile(Configuration.HTML_PATH, this.html);
    }

    private async generatePdfs() {
        const axeSource = await readFile("./node_modules/axe-core/axe.min.js", "utf-8");
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: "/usr/bin/chromium",
            args: [
                "--headless",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--enable-tagging",
                "--proxy-server='127.0.0.1:0'",
                "--host-resolver-rules=MAP localhost 127.0.0.1, EXCLUDE localhost",
            ],
        });

        const filesToProcess = [
            { content: this.html, path: Configuration.PDF_PATH, runAxe: true },
            { content: this.professionalHtml, path: Configuration.PROFESSIONAL_PDF_PATH, runAxe: false },
        ];

        for (const file of filesToProcess) {
            const page = await browser.newPage();
            await page.setContent(file.content, { waitUntil: "networkidle0" });

            if (file.runAxe) {
                await page.addScriptTag({ content: axeSource });
                this.axeResults = await page.evaluate(async () => {
                    // @ts-ignore
                    return await window.axe.run({
                        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
                    });
                });
            }

            await page.pdf({
                path: file.path,
                printBackground: true,
                preferCSSPageSize: true,
                tagged: true,
                outline: true,
            });
        }

        await browser.close();
    }

    private async addPdfMetadata() {
        for (const filePath of [Configuration.PDF_PATH, Configuration.PROFESSIONAL_PDF_PATH]) {
            const rawPdf = await readFile(filePath);
            const pdf = await PDFDocument.load(rawPdf, { updateMetadata: true });

            pdf.setTitle("Dylan Langston's Resume");
            pdf.setProducer("https://github.com/dylanlangston/resume");
            pdf.setCreator("Dylan Langston");
            pdf.setAuthor("Dylan Langston");
            pdf.setSubject("Resume");
            pdf.setCreationDate(new Date("1998-03-22T00:00:00Z"));
            pdf.setModificationDate(new Date(resume.meta.lastModified));
            pdf.setKeywords(
                resume.skills?.flatMap((s) => s.keywords).filter((kw): kw is string => typeof kw === "string") ?? []
            );
            pdf.attach(this.markdown, "resume.md", {
                mimeType: "text/markdown",
                description: "Markdown version of the resume",
                creationDate: new Date("1998-03-22T00:00:00Z"),
                modificationDate: new Date(resume.meta.lastModified),
                afRelationship: AFRelationship.Alternative
            });

            const optimized = await pdf.save({ useObjectStreams: true, addDefaultPage: false });
            await writeFile(filePath, optimized);
        }
    }
    
    private async createPolyglotFile() {
        await createPolyglot(Configuration.PDF_PATH, this.htmlCombinedMarkdown, Configuration.POLYGLOT_PATH);
    }
}

export default ResumeBuilder;