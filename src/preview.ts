import { promises as fs } from "fs";
import { render as localTheme, type Resume } from "./theme";
import { render } from "resumed";
import { fetch } from "bun";

const filename = "../dist/resume.pdf";
fs.mkdir("../dist").catch(() => { });

const resume = await (await fetch("https://gist.githubusercontent.com/dylanlangston/80380ec68b970189450dd2fae4502ff1/raw/resume.json")).json() as Resume;

const html: string = await render(resume, {
    render: localTheme
});

Bun.serve({
    port: 3000,
    fetch(req) {
        return new Response(html, {
            headers: {
                "Content-Type": "text/html; charset=utf-8"
            }
        });
    }
});

console.log("Server running at http://localhost:3000");
console.log("Press any key to exit...");

process.stdin.setRawMode?.(true);
process.stdin.resume();
process.stdin.on("data", () => {
    console.log("Exiting...");
    process.exit(0);
});