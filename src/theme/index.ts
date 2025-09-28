import { toHtml } from 'hast-util-to-html';
import { toMdast } from 'hast-util-to-mdast';
import { toMarkdown, type Handle } from 'mdast-util-to-markdown';
import { gfmToMarkdown } from 'mdast-util-gfm'
import * as resumed from "resumed";
import Theme, { reverseFormatTitle } from './theme.js';
import { applyTailwindToHast } from './applyTailwind';
import { minify, type Options } from 'minify'

type Resume = Parameters<typeof resumed.render>[0];

const renderHtmlBase = async (resume: Resume, forceDarkMode: boolean = false): Promise<string> => {
  const text = await renderText(resume);
  const baseTree = await Theme({
    resume, consoleMessage: text, forceDarkMode
  });
  const tailwindTree = await applyTailwindToHast(baseTree);

  const rawHtml = toHtml(tailwindTree);

  const minifiedHtml = await minify.html(rawHtml, {
    html: {
      minifyCSS: {
        level: 0,
      } as Options['css'],
      removeOptionalTags: false
    }
  });

  return minifiedHtml;
};
const renderHtml = async (resume: Resume) => await renderHtmlBase(resume, false);
const renderHtmlDark = async (resume: Resume) => await renderHtmlBase(resume, true);

const markdownHandler = (
  bodyFormat?: (body: string, ...args: Parameters<Handle>) => string,
  joinWith: string = ""
): Handle => (...args) => {
  const [node, _, state, info] = args;
  const children: any[] = node?.children ?? [];
  const body = children.map(child => state.handle(child, node, state, info)).filter(Boolean).join(joinWith);
  return bodyFormat?.(body, ...args) ?? body;
};

const renderMarkdown = async (resume: Resume): Promise<string> => {
  const tree = await Theme({resume, hideHeader: true});
  const mdast = toMdast(tree);

  return toMarkdown(mdast, {
    extensions: [gfmToMarkdown({ tableCellPadding: false })],
    handlers: {
      table: markdownHandler(),
      tableRow: markdownHandler(),
      tableCell: markdownHandler(),
      heading: markdownHandler((body, node) => {
        const { depth } = node;
        return `${"#".repeat(depth)} ${reverseFormatTitle(body)}`;
      }),
      link: markdownHandler((body, node) => {
        const { url, title } = node;
        return `[${(title ?? body)}](${url})`;
      }),
      code: markdownHandler((body, node) => {
        const { value }: { value: string } = node;
        return `\`\`\`figlet\n${value}\n\`\`\``;
      }),
    }
  });
};

const renderText = async (resume: Resume) => {
  const tree = await Theme({resume, hideHeader: true});
  const mdast = toMdast(tree);

  return toMarkdown(mdast, {
    handlers: {
      table: markdownHandler(),
      tableRow: markdownHandler(),
      tableCell: markdownHandler(),
      image: markdownHandler((body, node) => {
        const { url, alt } = node;
        return `${url} - ${alt}`;
      }),
      heading: markdownHandler((body) => reverseFormatTitle(body)),
      link: markdownHandler((body, node) => {
        const { url, title }: { url: string, title: string } = node;
        if (url.endsWith(title ?? body)) return url;
        return `${title ?? body}: ${url}`;
      }),
      code: markdownHandler((body, node) => {
        const { value }: { value: string } = node;
        return value;
      }),
    }
  });
};

export { renderHtml as render, renderHtml, renderHtmlDark, renderMarkdown, renderText, type Resume, Theme };
