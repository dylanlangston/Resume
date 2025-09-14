import { render as localTheme, type Resume } from "./theme";
import { render } from "resumed";
import { fetch } from "bun";
import config from "./config.json" assert { type: "json" };

const resume = await (await fetch(config.resumeUrl)).json() as Resume;

const html: string = await render(resume, {
    render: localTheme
});

Bun.serve({
    port: 3000,
    fetch(_) {
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