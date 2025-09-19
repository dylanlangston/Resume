import path from "path";
import { promises as fs } from "fs";
import { readFile } from "fs/promises";
import puppeteer from "puppeteer";
import { render } from "resumed";
import { render as renderHtml, renderMarkdown } from "jsonresume-theme-local";
import { PDFDocument } from "pdf-lib";
import type { AxeResults } from "axe-core";
import * as resume from "./resume/resume.json" assert { type: "json" };
import { test, expect } from "bun:test";

const OUT_DIR = "../out";
const PDF_PATH = path.join(OUT_DIR, "resume.pdf");
const HTML_PATH = path.join(OUT_DIR, "resume.html");
const MD_PATH = path.join(OUT_DIR, "resume.md");

await fs.mkdir(OUT_DIR).catch(() => {});

const html = await render(resume, { render: renderHtml });
await fs.writeFile(HTML_PATH, html);

const markdown = await render(resume, { render: renderMarkdown });
await fs.writeFile(MD_PATH, markdown);

const axeSource = await readFile("./node_modules/axe-core/axe.min.js", "utf-8");
const browser = await puppeteer.launch({
  headless: true,
  executablePath: "/usr/bin/chromium",
  args: ["--headless", "--enable-tagging"],
});
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle0" });
await page.addScriptTag({ content: axeSource });

const axeResults: AxeResults = await page.evaluate(async () => {
  // @ts-ignore
  return await window.axe.run({
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
  });
});

await page.pdf({
  path: PDF_PATH,
  printBackground: true,
  preferCSSPageSize: true,
  tagged: true,
  outline: true,
});
await browser.close();

const rawPdf = await fs.readFile(PDF_PATH);
const pdf = await PDFDocument.load(rawPdf, { updateMetadata: true });
pdf.setTitle("Dylan Langston's Resume");
pdf.setProducer("https://github.com/dylanlangston/resume");
pdf.setCreator("Dylan Langston");
pdf.setAuthor("Dylan Langston");
pdf.setSubject("Resume");
pdf.setCreationDate(new Date("1998-03-22T00:00:00Z"));
pdf.setKeywords(
  resume.skills?.flatMap((s) => s.keywords).filter((kw): kw is string => typeof kw === "string") ?? []
);
pdf.attach(markdown, "resume.md", {
  mimeType: "text/markdown",
  description: "Markdown version of the resume",
  creationDate: new Date("1998-03-22T00:00:00Z"),
  modificationDate: new Date(),
});
const optimized = await pdf.save({ useObjectStreams: true, addDefaultPage: false });
await fs.writeFile(PDF_PATH, optimized);

test("HTML generated successfully", async () => {
  const exists = await fs.stat(HTML_PATH).then(() => true).catch(() => false);
  expect(exists).toBe(true);
});

test("Markdown generated successfully", async () => {
  const exists = await fs.stat(MD_PATH).then(() => true).catch(() => false);
  expect(exists).toBe(true);
});

test("PDF generated successfully", async () => {
  const exists = await fs.stat(PDF_PATH).then(() => true).catch(() => false);
  expect(exists).toBe(true);
});

test("Accessibility violations should be zero", () => {
  expect(axeResults.violations.length).toBe(0);
});

test("PDF metadata is correct", async () => {
  const doc = await PDFDocument.load(await fs.readFile(PDF_PATH));
  expect(doc.getTitle()).toBe("Dylan Langston's Resume");
  expect(doc.getAuthor()).toBe("Dylan Langston");
});
