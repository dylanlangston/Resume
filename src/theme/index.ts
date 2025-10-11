import { toHtml } from 'hast-util-to-html';
import { toMdast } from 'hast-util-to-mdast';
import { toMarkdown, type Handle } from 'mdast-util-to-markdown';
import { gfmToMarkdown } from 'mdast-util-gfm'
import * as resumed from "resumed";
import Theme from './theme.js';
import { applyTailwindToHast } from './applyTailwind';
import { minify, type Options } from 'minify'
import { remove } from 'unist-util-remove'
import type { Result } from 'hastscript';

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
  const tree = await Theme({ resume, includeFigletCodeblock: true });
  removeUnusedElements(tree);
  const mdast = toMdast(tree);

  const markdown = toMarkdown(mdast, {
    extensions: [gfmToMarkdown({ tableCellPadding: false })],
    handlers: {
      table: markdownHandler(),
      tableRow: markdownHandler(),
      tableCell: markdownHandler(),
      heading: markdownHandler((body, node) => {
        const { depth } = node;
        return `${"#".repeat(depth)} ${body}`;
      }),
      thematicBreak: markdownHandler(() => ''),
      link: markdownHandler((body, node) => {
        const { url, title } = node;
        return `[${(title ?? body)}](${url})`;
      }),
      code: markdownHandler((body, node) => {
        const { value }: { value: string } = node;
        return `\`\`\`figlet\n${value}\n\`\`\``;
      }),
      listItem: markdownHandler((body, node) => {
        const { depth } = node;
        return `${" ".repeat(depth)}- ${body}`;
      })
    }
  });

  return markdown;
};

const renderText = async (resume: Resume) => {
  const tree = await Theme({ resume, includeFigletCodeblock: true });
  removeUnusedElements(tree);
  const mdast = toMdast(tree);

  const text = toMarkdown(mdast, {
    handlers: {
      table: markdownHandler(),
      tableRow: markdownHandler(),
      tableCell: markdownHandler(),
      image: markdownHandler((body, node) => {
        const { url, alt } = node;
        return `${alt}: ${url}`;
      }),
      heading: markdownHandler((body, node) => {
        const { depth } = node;
        return `[${"=".repeat(depth)} ${body} ${"=".repeat(depth)}]`;
      }),
      thematicBreak: markdownHandler(() => '---------------'),
      link: markdownHandler((body, node) => {
        const { url, title }: { url: string, title: string } = node;
        if (url.endsWith(title ?? body)) return url;
        return `${title ?? body}: ${url}`;
      }),
      code: markdownHandler((body, node) => {
        const { value }: { value: string } = node;
        return value;
      }),
      listItem: markdownHandler((body, node) => {
        const { depth } = node;
        return `${" ".repeat(depth)}- ${body}`;
      })
    }
  });

  const whitespaceRegex = /\n(\n)(?!This resume was generated from code available here:.+|(?=\[={1,2} ))/g

  return reduceWhiteSpace(text, whitespaceRegex);
};

const removeUnusedElements = (tree: Result) => {
  remove(tree, node => {
    if (node.type !== 'element') return false;
    const tagName: string = (node as any)?.tagName;
    switch (tagName) {
      case 'figcaption':
      case 'menu':
      case 'hr':
      case 'h':
        return true;
      default:
        return false;
    }
  })
}

const reduceWhiteSpace = (str: string, regex: RegExp): string => {
  let out = str.replaceAll(regex, '\n');
  while (true) {
    const iteration = out.replaceAll(regex, '\n');
    if (out === iteration) return iteration;
    else out = iteration;
  }
}

export { renderHtml as render, renderHtml, renderHtmlDark, renderMarkdown, renderText, type Resume, Theme };
