import { readFile } from "fs/promises";

// Fonts
import dejaVu from "./DejaVuSansMono-Regular.woff2";
import sourceCodePro from "./SourceCodePro.woff2";

const base64Prefix = "data:font/woff2;base64,";
const dejaVuBase64 = base64Prefix + (await readFile(dejaVu)).toString("base64");
const sourceCodeProBase64 = base64Prefix + (await readFile(sourceCodePro)).toString("base64");

const fonts = `
@font-face {
  font-family: "Source Code Pro";
  font-display: swap;
  font-style: normal;
  font-weight: 200 900;
  font-stretch: 100;
  src: url(${sourceCodeProBase64}) format("woff2");
}

@font-face {
  font-family: "DejaVu Sans Mono";
  font-display: swap;
  font-style: normal;
  font-weight: 400;
  font-stretch: 100;
  src: url(${dejaVuBase64}) format("woff2");
}
`;

export default fonts;