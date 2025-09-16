import { type Element } from 'hast';
import { h, type Child } from 'hastscript';
import { toHtml } from 'hast-util-to-html';
import { toMdast } from 'hast-util-to-mdast';
import { toMarkdown, type Handle } from 'mdast-util-to-markdown';
import { gfmToMarkdown } from 'mdast-util-gfm'
import { raw } from 'hast-util-raw'
import styles from './styles.css' assert { type: 'text' };
import * as resumed from "resumed";
import tailwindScript from "./node_modules/@tailwindcss/browser/dist/index.global.js" assert { type: "text" };
import fonts from './fonts/fonts';
import figlet from 'figlet'
import pixel from '@iconify-json/pixel/icons.json'

type Resume = Parameters<typeof resumed.render>[0];

const colors = {
  fg: { default: '#000000', muted: '#59636e' },
  canvas: { default: '#fff' },
  border: { default: '#000000', muted: '#d1d9e0' },
  accent: { fg: '#6639ba' },
  link: { fg: '#0550ae' },
  header: { title: '#cf222e', subtitle: '#953800' },
  neutral: { subtle: '#f6f8fa' },
};

const generateThemeStyles = (): string => `
  :root {
    --color-fg-default: ${colors.fg.default};
    --color-fg-muted: ${colors.fg.muted};
    --color-canvas-default: ${colors.canvas.default};
    --color-border-default: ${colors.border.default};
    --color-border-muted: ${colors.border.muted};
    --color-accent-fg: ${colors.accent.fg};
    --color-link-fg: ${colors.link.fg};
    --color-header-title: ${colors.header.title};
    --color-header-subtitle: ${colors.header.subtitle};
    --color-neutral-subtle: ${colors.neutral.subtle};
  }
  .bg-canvas { background-color: var(--color-canvas-default) !important; }
  .text-muted { color: var(--color-fg-muted) !important; }
  .text-accent { color: var(--color-accent-fg) !important; }
  .border-muted { border-color: var(--color-border-muted) !important; }
  .bg-subtle { background-color: var(--color-neutral-subtle) !important; }
  .title{ color: var(--color-header-title) !important; }
  .subtitle { color: var(--color-header-subtitle) !important; }
  .link { color: var(--color-link-fg) !important; text-decoration: underline; }
  .link:hover { text-decoration: none; }
  td { vertical-align: top; }
`;

const formatTitle = (val: string): string => {
  return val.split(' ').map(s => String(s).charAt(0).toLowerCase() + String(s).slice(1)).join('_')
}

function reverseFormatTitle(val: string): string {
  return val.split('_').map(s => String(s).charAt(0).toUpperCase() + String(s).slice(1)).join(' ')
}

const renderSection = (title: string, content: (Element | string)[] | undefined | null): Element | null => {
  if (!content || content.length === 0) return null;
  return h('section', { className: 'pb-2 border-t-1 border-muted' }, [
    h('div', { className: 'flex  pl-1 hidden-open-bracket' }, [
      h('h2', { className: 'hidden-equal subtitle', 'title': title }, [
        formatTitle(title),
      ]),
    ]),
    [
      ...content,
      h('span', { 'aria-hidden': true, className: 'hidden-close-bracket' }, ''),
    ]
  ]);
};

const renderHighlights = (highlights: string[] | undefined): Element | null => {
  if (!highlights || highlights.length === 0) return null;
  return h('ul', { className: 'list-equals list-inside pl-2' },
    highlights.map(highlight => h('li', {}, highlight))
  );
};

const embedImage = async (uri: string): Promise<string> => {
  const response = await fetch(uri);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const mimeType = response.headers.get('content-type');
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
};

const renderBasics = async (basics: Resume['basics']): Promise<Element> => {
  const profileIcons: Record<string, string> = {
    'LinkedIn': pixel.icons.linkedin.body,
    'GitHub': pixel.icons.github.body,
    'Itch.io': pixel.icons.gaming.body,
  }
  const profileName: Record<string, (name: string) => string> = {
    'LinkedIn': (name: string) => `linkedin.com/in/${name}`,
    'GitHub': (name: string) => `github.com/${name}`,
    'Itch.io': (name: string) => `${name}.itch.io`,
  }

  if (!basics) return h('section', { className: 'pb-2 border-t-1 border-muted' }, []);
  return h('section', { className: 'pb-2 border-t-1 border-muted' }, [
    h('div', { className: 'flex' }, [
      basics.image && h('picture', {}, [
        h('source', {
          srcset: await embedImage(basics.image)
        }),
        h('img', {
          className: 'w-30 min-w-30 h-30 rounded-2xl ml-1 my-1',
          src: basics.image,
          alt: `A portrait of ${basics.name}`
        }),
      ]),
      h('div', { className: 'px-1 text-center m-auto' }, [
        basics.name && h('span', { style: 'font: italic 12px monospace;line-height: 12px;', 'aria-label': basics.name, className: 'text-accent whitespace-pre mt-1' },
          [
            h('h1', { className: 'name' }, basics.name),
            h('pre', { 'aria-hidden': true, style: 'user-select: none;' }, await figlet.text(basics.name, {
              font: "Tmplr"
            }))
          ]
        ),
        basics.label && h('h4', { className: 'text-muted -mt-1' }, basics.label),
      ]),
    ]),
    h('address', { className: 'not-italic mx-2' }, [
      basics.location && h('p', {}, [
        `${basics.location.city}, ${basics.location.region}`.trim()
      ]),
      basics.email && h('p', {}, [
        raw(h('svg', { height: '16', width: '16', viewBox: "0 0 24 24", color: '#6639ba', className: 'inline mr-1', xmlns: 'http://www.w3.org/2000/svg' },
          { type: 'raw', value: pixel.icons.envelope.body } as any
        )),
        h('a', { className: 'link', href: `mailto:${basics.email}` }, basics.email)]),
      basics.url && h('p', {}, [
        raw(h('svg', { height: '16', width: '16', viewBox: "0 0 24 24", color: '#6639ba', className: 'inline mr-1', xmlns: 'http://www.w3.org/2000/svg' },
          { type: 'raw', value: pixel.icons.globe.body } as any
        )),
        h('a', { className: 'link', href: basics.url, target: '_blank' }, basics.url)]),
    ]),
    basics.profiles && h('div', { className: 'mx-2' }, basics.profiles.map(profile =>
      profile.network && h('p', {}, [
        raw(h('svg', { height: '16', width: '16', viewBox: "0 0 24 24", color: '#6639ba', className: 'inline mr-1', xmlns: 'http://www.w3.org/2000/svg' },
          { type: 'raw', value: profileIcons[profile.network]! } as any
        )),
        profile.url ? h('a', { className: 'link', href: profile.url, target: '_blank' }, `${profileName[profile.network]!(profile.username!)}`) : `${profileName[profile.network]!(profile.username!)}`
      ])
    )),
  ].filter(Boolean) as (Element | string)[]);
};

const renderWork = (work: Resume['work']) => work?.map(job =>
  h('.item ml-4 mr-2', [
    h('div', { className: 'flex justify-between items-baseline' }, [
      h('h3', { className: 'title' }, job.name),
      (job.startDate || job.endDate) && h('p', { className: ' min-w-fit ml-6' }, [
        h('time', { datetime: job.startDate, className: 'text-accent' }, job.startDate),
        h('span', { className: 'text-muted' }, ` til `),
        h('time', { datetime: job.endDate, className: 'text-accent' }, job.endDate ?? 'Present'),
      ]),
    ]),
    job.position && h('h4', { className: 'text-muted' }, job.position),
    job.summary && h('p', {}, job.summary),
    renderHighlights(job.highlights),
  ])
);

const renderProjects = (projects: Resume['projects']) => projects?.map(project =>
  h('.item ml-4 mr-2', [
    h('div', { className: 'flex justify-between items-baseline' }, [
      h('h3', { className: 'title' }, project.name),
      project.url && h('a', { 'title': 'View Project', className: 'link ', href: project.url, target: '_blank' }, 'view_project'),
    ]),
    project.keywords && h('h4', { className: ' text-muted' }, `Technologies: ${project.keywords.join(', ')}`),
    project.description && h('p', {}, project.description),
    renderHighlights(project.highlights),
  ])
);

const renderSkills = (skills: Resume['skills']) => skills?.map(skill =>
  h('.item ml-4 mr-2', [
    skill.name && h('h3', { className: 'title' }, skill.name),
    skill.level && h('h4', { className: ' text-muted' }, `Level: ${skill.level}`),
    skill.keywords && h('ul', { className: 'flex flex-wrap gap-1 hidden-open-bracket-square hidden-close-bracket-square' },
      skill.keywords.map(keyword => h('li', { className: 'hidden-comma' },
        h('span', { className: 'bg-subtle  font-medium px-2 rounded' }, keyword)
      ))
    ),
  ])
);

const renderAwards = (awards: Resume['awards']) => awards?.map(award =>
  h('.item ml-4 mr-2', [
    h('div', { className: 'flex justify-between items-baseline' }, [
      h('h3', { className: 'title' }, award.title),
      award.date && h('p', { className: ' text-muted' }, award.date),
    ]),
    award.awarder && h('p', {}, `Awarded by: ${award.awarder}`),
    award.summary && h('p', {}, award.summary),
  ])
);

const renderCertificates = (certificates: Resume['certificates']) => certificates?.map(cert =>
  h('.item ml-4 mr-2', [
    h('div', { className: 'flex justify-between items-baseline' }, [
      h('h3', { className: 'title' }, cert.name),
      cert.date && h('p', { className: ' text-muted' }, cert.date),
    ]),
    cert.issuer && h('h4', { className: 'text-muted' }, `Issuer: ${cert.issuer}`),
    cert.url && h('p', {}, [h('a', { 'title': 'View Certificate', className: 'link', href: cert.url, target: '_blank' }, 'view_certificate')]),
  ])
);

const renderPublications = (publications: Resume['publications']) => publications?.map(pub =>
  h('.item ml-4 mr-2', [
    h('div', { className: 'flex justify-between items-baseline' }, [
      h('h3', { className: 'title' }, pub.name),
      pub.releaseDate && h('p', { className: ' text-muted' }, pub.releaseDate),
    ]),
    pub.publisher && h('p', {}, `Publisher: ${pub.publisher}`),
    pub.summary && h('p', {}, pub.summary),
    pub.url && h('p', {}, [h('a', { 'title': 'Read Publication', className: 'link', href: pub.url, target: '_blank' }, 'read_publication')]),
  ])
);

const getTree = async (resume: Resume): Promise<Element> => {
  const {
    basics,
    work,
    awards,
    certificates,
    publications,
    skills,
    projects,
  } = resume;

  const leftColumnContent = [
    await renderBasics(basics),
    renderSection('Skills', renderSkills(skills))
  ].filter(Boolean) as (Element | string)[];

  const rightColumnContent = [
    basics?.summary ? renderSection('About', [h('p', { className: 'ml-4 mr-2' }, basics.summary)]) : null,
    renderSection('Work Experience', renderWork(work)),
    renderSection('Projects', renderProjects(projects)),
    renderSection('Awards', renderAwards(awards)),
    renderSection('Certificates', renderCertificates(certificates)),
    renderSection('Publications', renderPublications(publications)),
  ].filter(Boolean) as (Element | string)[];

  return h('html', { lang: 'en' }, [
    h('head', [
      h('meta', { charSet: 'utf-8' }),
      h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      h('title', basics?.name ? `${basics.name}'s Resume` : 'Resume'),
      h('style', fonts),
      h('style', styles),
      h('script', [], tailwindScript),
      h('style', generateThemeStyles()),
    ]),
    h('body', { className: 'leading-normal' }, [
      h('div', { className: 'mx-auto bg-canvas' }, [
        h('div', { className: 'md:flex' }, [
          h('div', { className: 'w-full md:w-[35%] md:min-w-[380px] min-w-print-0 border-l border-b border-r md:border-r-0 border-muted' }, leftColumnContent),
          h('div', { className: 'w-full md:w-[65%] border-x border-b border-muted' }, rightColumnContent),
        ]),
      ]),
    ]),
  ]);
};

const render = async (resume: Resume): Promise<string> => {
  const tree = await getTree(resume);
  return toHtml(tree);
};


const renderMarkdown = async (resume: Resume): Promise<string> => {
  const tree = await getTree(resume);
  const mdast = toMdast(tree);
  const handler = (joinWith: string = ""): Handle => (node, _, state, info) => {
    const children: any[] = node?.children ?? [];
    const body = children.map(child => state.handle(child, node, state, info)).filter(Boolean).join(joinWith);
    return body;
  };
  return toMarkdown(mdast, {
    extensions: [gfmToMarkdown({
      tableCellPadding: false
    })],
    handlers: {
      table: handler(),
      tableRow: handler("\n\n"),
      tableCell: handler("\n\n"),
      heading: (node, _, state, info) => {
        const { depth } = node;
        const children: any[] = node?.children ?? [];
        const body = children.map(child => state.handle(child, node, state, info)).filter(Boolean).join("\n\n");
        return `${"#".repeat(depth)} ${reverseFormatTitle(body)}`;
      },
      link: (node, _, state, info) => {
        const { url, title } = node;
        const children: any[] = node?.children ?? [];
        const body = children.map(child => state.handle(child, node, state, info)).filter(Boolean).join("");
        return `[${(title ?? body)}](${url})`
      }
    }
  });
};
export { render, renderMarkdown, type Resume };