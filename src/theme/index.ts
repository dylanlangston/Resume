import { toHtml } from 'hast-util-to-html';
import { toMdast } from 'hast-util-to-mdast';
import { toMarkdown, type Handle } from 'mdast-util-to-markdown';
import { gfmToMarkdown } from 'mdast-util-gfm'
import * as resumed from "resumed";
import Theme, { reverseFormatTitle } from './theme.js';
import { applyTailwindToHast } from './applyTailwind';
import { minify, type Options } from 'minify'

type Resume = Parameters<typeof resumed.render>[0];

const renderHtml = async (resume: Resume): Promise<string> => {
  const baseTree = await Theme(resume, false);

  const tailwindTree = await applyTailwindToHast(baseTree);

  const rawHtml = toHtml(tailwindTree);

  const minifiedHtml = await minify.html(rawHtml, {
    html: {
      minifyCSS: {
        level: 0,
      } as Options['css'],
      removeOptionalTags: false
    }
  })

  return minifiedHtml
};

const renderMarkdown = async (resume: Resume): Promise<string> => {
  const tree = await Theme(resume, true);
  const mdast = toMdast(tree);
  
  const handler = (bodyFormat?: (body: string, ...args: Parameters<Handle>) => string, joinWith: string = ""): Handle => (...args) => {
    const [node, _, state, info] = args;
    const children: any[] = node?.children ?? [];
    const body = children.map(child => state.handle(child, node, state, info)).filter(Boolean).join(joinWith);
    return bodyFormat?.(body, ...args) ?? body;
  };
  return toMarkdown(mdast, {
    extensions: [gfmToMarkdown({
      tableCellPadding: false
    })],
    handlers: {
      table: handler(),
      tableRow: handler(),
      tableCell: handler(),
      heading: handler((body, node) => {
        const { depth } = node;
        return `${"#".repeat(depth)} ${reverseFormatTitle(body)}`
      }),
      link: handler((body, node) => {
        const { url, title } = node;
        return `[${(title ?? body)}](${url})`
      }),
      code: handler((body, node, _, state, info) => {
        const { value }: { value: string } = node;
        return `\`\`\`figlet\n${value}\n\`\`\``;
      }),
    }
  });
};

export { renderHtml as render, renderHtml, renderMarkdown, type Resume, Theme };