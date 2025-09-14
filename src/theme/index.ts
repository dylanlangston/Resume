import { type Element } from 'hast';
import { h } from 'hastscript';
import { toHtml } from 'hast-util-to-html';
import { toMdast } from 'hast-util-to-mdast';
import { toMarkdown, type Handle } from 'mdast-util-to-markdown';
import { gfmToMarkdown } from 'mdast-util-gfm'
import styles from './styles.css' assert { type: 'text' };
import * as resumed from "resumed";
import tailwindScript from "./node_modules/@tailwindcss/browser/dist/index.global.js" assert { type: "text" };
import sourceCodePro from './source-code-pro';

type Resume = Parameters<typeof resumed.render>[0];

const colors = {
  fg: { default: '#1f2328', muted: '#656d76' },
  canvas: { default: '#ffffff' },
  border: { default: '#d8dee4', muted: '#d8dee4' },
  accent: { fg: '#0969da' },
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
    --color-neutral-subtle: ${colors.neutral.subtle};
  }
  .bg-canvas { background-color: var(--color-canvas-default) !important; }
  .text-muted { color: var(--color-fg-muted) !important; }
  .text-accent { color: var(--color-accent-fg) !important; }
  .border-muted { border-color: var(--color-border-muted) !important; }
  .bg-subtle { background-color: var(--color-neutral-subtle) !important; }
  .link { color: var(--color-accent-fg) !important; text-decoration: none; }
  .link:hover { text-decoration: underline; }
  td { vertical-align: top; }
`;

const renderSection = (title: string, content: (Element | string)[] | undefined | null): Element | null => {
  if (!content || content.length === 0) return null;
  return h('section', { className: 'pb-2 border-t-1 border-muted' }, [
    h('h2', { className: 'pt-1 mb-1 pl-1' }, title),
    ...content
  ]);
};

const renderHighlights = (highlights: string[] | undefined): Element | null => {
  if (!highlights || highlights.length === 0) return null;
  return h('ul', { className: 'list-disc list-inside mt-2 pl-2' },
    highlights.map(highlight => h('li', { className: 'mb-1' }, highlight))
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
  if (!basics) return h('section', { className: 'pb-2 border-t-1 border-muted' }, []);
  return h('section', { className: 'pb-2 border-t-1 border-muted' }, [
    basics.image && h('picture', { className: 'border-t' }, [
      h('source', {
        srcset: await embedImage(basics.image)
      }),
      h('img', {
        className: 'w-32 h-32 rounded-lg mx-auto my-2',
        src: basics.image,
        alt: `A portrait of ${basics.name}`
      }),
    ]),
    h('div', { className: 'text-center' }, [
      basics.name && h('h1', {}, basics.name),
      basics.label && h('p', { className: 'text-muted mt-1' }, basics.label),
    ]),
    h('address', { className: 'not-italic mt-2 mx-2' }, [
      basics.location && h('p', { className: 'mb-1' }, [
        `${basics.location.city}, ${basics.location.region}`.trim()
      ]),
      basics.email && h('p', { className: 'mb-1' }, [h('a', { className: 'link', href: `mailto:${basics.email}` }, basics.email)]),
      basics.phone && h('p', { className: 'mb-1' }, basics.phone),
      basics.url && h('p', { className: 'mb-1' }, [h('a', { className: 'link', href: basics.url, target: '_blank' }, basics.url)]),
    ]),
    basics.profiles && h('div', { className: 'mt-1 mx-2' }, basics.profiles.map(profile =>
      h('p', { className: 'mb-1' }, [
        h('span', { style: 'font-weight: bold;' }, `${profile.network}: `),
        profile.url ? h('a', { className: 'link', href: profile.url, target: '_blank' }, profile.username) : profile.username
      ])
    )),
  ].filter(Boolean) as (Element | string)[]);
};

const renderWork = (work: Resume['work']) => work?.map(job =>
  h('.item mx-2', [
    h('div', { className: 'flex justify-between items-baseline' }, [
      h('h3', {}, job.name),
      (job.startDate || job.endDate) && h('p', { className: 'text-xs text-muted' }, `${job.startDate || ''} – ${job.endDate || 'Present'}`),
    ]),
    job.position && h('h4', { className: 'text-accent' }, job.position),
    job.summary && h('p', { className: 'mt-1' }, job.summary),
    renderHighlights(job.highlights),
  ])
);

const renderProjects = (projects: Resume['projects']) => projects?.map(project =>
  h('.item mx-2', [
    h('div', { className: 'flex justify-between items-baseline' }, [
      h('h3', {}, project.name),
      project.url && h('a', { className: 'link text-xs', href: project.url, target: '_blank' }, 'View Project'),
    ]),
    project.description && h('p', { className: 'mt-1' }, project.description),
    renderHighlights(project.highlights),
    project.keywords && h('p', { className: 'mt-2 text-xs text-muted' }, `Technologies: ${project.keywords.join(', ')}`),
  ])
);

const renderSkills = (skills: Resume['skills']) => skills?.map(skill =>
  h('.item mx-2', [
    skill.name && h('h3', {}, skill.name),
    skill.level && h('p', { className: 'text-xs text-muted' }, `Level: ${skill.level}`),
    skill.keywords && h('ul', { className: 'flex flex-wrap gap-1 mt-1' },
      skill.keywords.map(keyword => h('li', { className: 'bg-subtle text-xs font-medium px-2 py-0.5 rounded' }, keyword))
    ),
  ])
);

const renderAwards = (awards: Resume['awards']) => awards?.map(award =>
  h('.item mx-2', [
    h('div', { className: 'flex justify-between items-baseline' }, [
      h('h3', {}, award.title),
      award.date && h('p', { className: 'text-xs text-muted' }, award.date),
    ]),
    award.awarder && h('p', {}, `Awarded by: ${award.awarder}`),
    award.summary && h('p', { className: 'mt-1' }, award.summary),
  ])
);

const renderCertificates = (certificates: Resume['certificates']) => certificates?.map(cert =>
  h('.item mx-2', [
    h('div', { className: 'flex justify-between items-baseline' }, [
      h('h3', {}, cert.name),
      cert.date && h('p', { className: 'text-xs text-muted' }, cert.date),
    ]),
    cert.issuer && h('p', {}, `Issuer: ${cert.issuer}`),
    cert.url && h('p', { className: 'mt-1' }, [h('a', { className: 'link', href: cert.url, target: '_blank' }, 'View Certificate')]),
  ])
);

const renderPublications = (publications: Resume['publications']) => publications?.map(pub =>
  h('.item mx-2', [
    h('div', { className: 'flex justify-between items-baseline' }, [
      h('h3', {}, pub.name),
      pub.releaseDate && h('p', { className: 'text-xs text-muted' }, pub.releaseDate),
    ]),
    pub.publisher && h('p', {}, `Publisher: ${pub.publisher}`),
    pub.summary && h('p', { className: 'mt-1' }, pub.summary),
    pub.url && h('p', { className: 'mt-1' }, [h('a', { className: 'link', href: pub.url, target: '_blank' }, 'Read Publication')]),
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
    basics?.summary ? renderSection('About', [h('p', { className: 'mx-2' }, basics.summary)]) : null,
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
      h('style', sourceCodePro),
      h('style', styles),
      h('script', [], tailwindScript),
      h('style', generateThemeStyles()),
    ]),
    h('body', { className: 'leading-normal' }, [
      h('div', { className: 'mx-auto bg-canvas' }, [
        h('table', { className: 'w-full border-collapse' }, [
          h('tbody', [
            h('tr', [
              h('td', { className: 'w-[35%] border-l border-b border-muted' }, leftColumnContent),
              h('td', { className: 'w-[65%] border-x border-b border-muted' }, rightColumnContent),
            ]),
          ]),
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
      tableCell: handler("\n\n")
    }
  });
};
export { render, renderMarkdown, type Resume };