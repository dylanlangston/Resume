import { readFile, stat } from "fs/promises";
import { PDFDocument } from "pdf-lib";
import * as resume from "./resume/resume.json" assert { type: "json" };
import { test, expect, beforeAll } from "bun:test";
import ResumeBuilder from "./resume-builder";
import { Configuration } from "./config";

let builder: ResumeBuilder;

beforeAll(async () => {
    builder = new ResumeBuilder();
    await builder.build();
});

test("Text generated successfully", async () => {
    const exists = await stat(Configuration.TXT_PATH).then(() => true).catch(() => false);
    expect(exists).toBe(true);
});

test("HTML generated successfully", async () => {
    const exists = await stat(Configuration.HTML_PATH).then(() => true).catch(() => false);
    expect(exists).toBe(true);
});

test("Markdown generated successfully", async () => {
    const exists = await stat(Configuration.MD_PATH).then(() => true).catch(() => false);
    expect(exists).toBe(true);
});

test("PDFs generated successfully", async () => {
    for (const file of [Configuration.PDF_PATH, Configuration.PDF_DARK_PATH, Configuration.PROFESSIONAL_PDF_PATH, Configuration.POLYGLOT_PATH, Configuration.POLYGLOT_DARK_PATH]) {
        const exists = await stat(file).then(() => true).catch(() => false);
        expect(exists).toBe(true);
    }
});

test("Accessibility violations should be zero", () => {
    expect(builder.axeResults).toBeDefined();
    for (const violation of builder.axeResults.violations)
    {
        console.error(violation)
    }
    expect(builder.axeResults.violations.length).toBe(0);
});

test("PDF metadata is correct", async () => {
    for (const file of [Configuration.PDF_PATH, Configuration.PDF_DARK_PATH, Configuration.PROFESSIONAL_PDF_PATH, Configuration.POLYGLOT_PATH, Configuration.POLYGLOT_DARK_PATH]) {
        const doc = await PDFDocument.load(await readFile(file), { updateMetadata: false });
        expect(doc.getTitle()).toBe("Dylan Langston's Resume");
        expect(doc.getAuthor()).toBe("Dylan Langston");
        expect(doc.getModificationDate()).toEqual(new Date(resume.meta.lastModified));
    }
});