import { readFile } from "fs/promises";

// Fonts
import sourceCodeProCyrillicExt from "./node_modules/@fontsource/source-code-pro/files/source-code-pro-cyrillic-ext-400-normal.woff2";
import sourceCodeProCyrillic from "./node_modules/@fontsource/source-code-pro/files/source-code-pro-cyrillic-400-normal.woff2";
import sourceCodeProGreekExt from "./node_modules/@fontsource/source-code-pro/files/source-code-pro-greek-ext-400-normal.woff2";
import sourceCodeProGreek from "./node_modules/@fontsource/source-code-pro/files/source-code-pro-greek-400-normal.woff2";
import sourceCodeProVietnamese from "./node_modules/@fontsource/source-code-pro/files/source-code-pro-vietnamese-400-normal.woff2";
import sourceCodeProLatinExt from "./node_modules/@fontsource/source-code-pro/files/source-code-pro-latin-ext-400-normal.woff2";
import sourceCodeProLatin from "./node_modules/@fontsource/source-code-pro/files/source-code-pro-latin-400-normal.woff2";

const base64Prefix = "data:font/woff2;base64,";
const sourceCodeProCyrillicExtBase64 = base64Prefix + (await readFile(sourceCodeProCyrillicExt)).toString("base64");
const sourceCodeProCyrillicBase64 = base64Prefix + (await readFile(sourceCodeProCyrillic)).toString("base64");
const sourceCodeProGreekExtBase64 = base64Prefix + (await readFile(sourceCodeProGreekExt)).toString("base64");
const sourceCodeProGreekBase64 = base64Prefix + (await readFile(sourceCodeProGreek)).toString("base64");
const sourceCodeProVietnameseBase64 = base64Prefix + (await readFile(sourceCodeProVietnamese)).toString("base64");
const sourceCodeProLatinExtBase64 = base64Prefix + (await readFile(sourceCodeProLatinExt)).toString("base64");
const sourceCodeProLatinBase64 = base64Prefix + (await readFile(sourceCodeProLatin)).toString("base64");

const sourceCodePro = `
/* source-code-pro-cyrillic-ext-400-normal */
@font-face {
  font-family: 'Source Code Pro';
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url(${sourceCodeProCyrillicExtBase64}) format('woff2');
  unicode-range: U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F;
}

/* source-code-pro-cyrillic-400-normal */
@font-face {
  font-family: 'Source Code Pro';
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url(${sourceCodeProCyrillicBase64}) format('woff2');
  unicode-range: U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116;
}

/* source-code-pro-greek-ext-400-normal */
@font-face {
  font-family: 'Source Code Pro';
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url(${sourceCodeProGreekExtBase64}) format('woff2');
  unicode-range: U+1F00-1FFF;
}

/* source-code-pro-greek-400-normal */
@font-face {
  font-family: 'Source Code Pro';
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url(${sourceCodeProGreekBase64}) format('woff2');
  unicode-range: U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF;
}

/* source-code-pro-vietnamese-400-normal */
@font-face {
  font-family: 'Source Code Pro';
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url(${sourceCodeProVietnameseBase64}) format('woff2');
  unicode-range: U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB;
}

/* source-code-pro-latin-ext-400-normal */
@font-face {
  font-family: 'Source Code Pro';
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url(${sourceCodeProLatinExtBase64}) format('woff2');
  unicode-range: U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;
}

/* source-code-pro-latin-400-normal */
@font-face {
  font-family: 'Source Code Pro';
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url(${sourceCodeProLatinBase64}) format('woff2');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
`;

export default sourceCodePro;