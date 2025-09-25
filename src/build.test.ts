import path from "path";
import { mkdir, readFile, stat, writeFile } from "fs/promises";
import puppeteer from "puppeteer";
import { render } from "resumed";
import { render as renderHtml, renderMarkdown } from "jsonresume-theme-local";
import { AFRelationship, PDFDocument } from "pdf-lib";
import type { AxeResults } from "axe-core";
import * as resume from "./resume/resume.json" assert { type: "json" };
import { test, expect } from "bun:test";
// @ts-ignore
import { render as professional } from "jsonresume-theme-professional"
import { suppressErrors } from "./suppress-errors";
import { createPolyglot } from "./createPolyglot";

const OUT_DIR = "../out";
const PDF_PATH = path.join(OUT_DIR, "resume.pdf");
const PROFESSIONAL_PDF_PATH = path.join(OUT_DIR, "professional.pdf");
const HTML_PATH = path.join(OUT_DIR, "resume.html");
const MD_PATH = path.join(OUT_DIR, "resume.md");
const POLYGLOT_PATH = path.join(OUT_DIR, "resume.md.html.pdf");

await mkdir(OUT_DIR).catch(() => { });

const html = await render(resume, { render: renderHtml });
const professionalHtml = await suppressErrors(() => render(resume, { render: professional }))

const markdown = await render(resume, { render: renderMarkdown });

const htmlCombinedMarkdown = `<!--\n${markdown}\n-->${html}`;

await writeFile(MD_PATH, markdown);
await writeFile(HTML_PATH, html);

const axeSource = await readFile("./node_modules/axe-core/axe.min.js", "utf-8");
const browser = await puppeteer.launch({
  headless: true,
  executablePath: "/usr/bin/chromium",
  args: [
    "--headless",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--enable-tagging",
    // restrict Puppeteer/Chromium to only access localhost
    // stops false positives from gtag analytics
    "--proxy-server='127.0.0.1:0'",
    "--host-resolver-rules=MAP localhost 127.0.0.1, EXCLUDE localhost"],
});

let axeResults: AxeResults;
for (const file of [{ content: html, path: PDF_PATH, axe: true }, { content: professionalHtml, path: PROFESSIONAL_PDF_PATH, axe: false }]) {
  const page = await browser.newPage();
  await page.setContent(file.content, { waitUntil: "networkidle0" });

  if (file.axe) {
    await page.addScriptTag({ content: axeSource });
    axeResults = await page.evaluate(async () => {
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

for (const file of [PDF_PATH, PROFESSIONAL_PDF_PATH]) {
  const rawPdf = await readFile(file);
  const pdf = await PDFDocument.load(rawPdf, { updateMetadata: true });
  pdf.setTitle("Dylan Langston's Resume");
  pdf.setProducer("https://github.com/dylanlangston/resume");
  pdf.setCreator("Dylan Langston");
  pdf.setAuthor("Dylan Langston");
  pdf.setSubject("Resume");
  pdf.setCreationDate(new Date("1998-03-22T00:00:00Z"));
  pdf.setModificationDate(new Date(resume.meta.lastModified))
  // pdf.addJavaScript("test", "app.alert('Check out https://resume.dylanlangston.com/ too!');")
  pdf.setKeywords(
    resume.skills?.flatMap((s) => s.keywords).filter((kw): kw is string => typeof kw === "string") ?? []
  );
  pdf.attach(markdown, "resume.md", {
    mimeType: "text/markdown",
    description: "Markdown version of the resume",
    creationDate: new Date("1998-03-22T00:00:00Z"),
    modificationDate: new Date(resume.meta.lastModified),
    afRelationship: AFRelationship.Alternative
  });

  const optimized = await pdf.save({ useObjectStreams: true, addDefaultPage: false });
  await writeFile(file, optimized);
}

await createPolyglot(PDF_PATH, htmlCombinedMarkdown, POLYGLOT_PATH)

test("HTML generated successfully", async () => {
  const exists = await stat(HTML_PATH).then(() => true).catch(() => false);
  expect(exists).toBe(true);
});

test("Markdown generated successfully", async () => {
  const exists = await stat(MD_PATH).then(() => true).catch(() => false);
  expect(exists).toBe(true);
});

test("PDF generated successfully", async () => {
  for (const file of [PDF_PATH, PROFESSIONAL_PDF_PATH, POLYGLOT_PATH]) {

    const exists = await stat(file).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  }
});

test("Accessibility violations should be zero", () => {
  expect(axeResults.violations.length).toBe(0);
});

test("PDF metadata is correct", async () => {
  for (const file of [PDF_PATH, PROFESSIONAL_PDF_PATH, POLYGLOT_PATH]) {
    const doc = await PDFDocument.load(await readFile(file), {updateMetadata: false});
    expect(doc.getTitle()).toBe("Dylan Langston's Resume");
    expect(doc.getAuthor()).toBe("Dylan Langston");
    expect(doc.getModificationDate()).toEqual(new Date(resume.meta.lastModified));
  }
});
