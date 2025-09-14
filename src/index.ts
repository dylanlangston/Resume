import { promises as fs } from "fs";
import { render as localTheme } from "jsonresume-theme-local";
import puppeteer from "puppeteer";
import { render } from "resumed";
import { PDFDocument } from "pdf-lib";
import { fetch } from "bun";
import { readFile } from 'fs/promises';
import type { AxeResults } from "axe-core";
import { Console } from "console";
import path from "path";
const axeSource = await readFile('./node_modules/axe-core/axe.min.js', 'utf-8');

type Resume = Parameters<typeof render>[0];

const filename = "../dist/resume.pdf";
fs.mkdir("../dist").catch(() => {});

const resume = await (await fetch("https://gist.githubusercontent.com/dylanlangston/80380ec68b970189450dd2fae4502ff1/raw/resume.json")).json() as Resume;

const html: string = await render(resume, {
  render: localTheme
});

const browser = await puppeteer.launch({
  headless: true,
  executablePath: "/usr/bin/chromium",
  args: ["--headless", "--no-sandbox", "--disable-setuid-sandbox"]
});
const page = await browser.newPage();

await page.setContent(html, { waitUntil: "networkidle0" });

// Inject axe-core script into the page
await page.addScriptTag({ content: axeSource });

// Run accessibility check in browser context
const axeResults: AxeResults = await page.evaluate(async () => {
  // @ts-ignore: 'window' is available in the browser context
  return await window.axe.run({
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] }
  });
});

if (axeResults.violations.length > 0) {
  console.warn("Accessibility issues found:");
  axeResults.violations.forEach(v => {
    console.warn(`Rule: ${v.id}, Impact: ${v.impact}`);
    v.nodes.forEach(node => console.warn(` - ${node.html}`));
  });
  process.exit(1);
}
await page.pdf({ path: filename, format: "a4", printBackground: true });

await browser.close();

const raw = await fs.readFile(filename);
const pdf = await PDFDocument.load(raw, { updateMetadata: true });

pdf.setTitle("Dylan Langston's Resume");
pdf.setProducer("");
pdf.setCreator("Dylan Langston");
pdf.setAuthor("Dylan Langston");
pdf.setSubject("Resume");
pdf.setCreationDate(new Date("1998-03-22T00:00:00Z"));
pdf.setKeywords(resume.skills?.flatMap(skill => skill.keywords).filter((name): name is string => typeof name === "string") ?? []);

const optimized = await pdf.save({
  useObjectStreams: true,
  addDefaultPage: false,
});
await fs.writeFile(filename, optimized);

console.log("PDF generated at", path.resolve(filename));