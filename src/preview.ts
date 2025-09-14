import { render as localTheme } from "./theme";
import { render } from "resumed";
import * as resume from "./resume/resume.json" assert { type: "json" };

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