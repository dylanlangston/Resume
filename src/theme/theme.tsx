/** @jsxImportSource hastscript */
import { type Doctype } from 'hast';
import { raw } from 'hast-util-raw';
import styles from './styles.css' assert { type: 'text' };
import * as resumed from "resumed";
import fonts from './fonts/fonts';
import figlet from 'figlet';
import pixel from '@iconify-json/pixel/icons.json';
import { type Result } from 'hastscript';

type Resume = Parameters<typeof resumed.render>[0];

const colors = {
    light: {
        fg: { default: '#000000', muted: '#59636e' },
        canvas: { default: '#fff' },
        border: { default: '#000000', muted: '#d1d9e0' },
        accent: { fg: '#6639ba' },
        link: { fg: '#0550ae' },
        header: { title: '#cf222e', subtitle: '#953800' },
        neutral: { subtle: '#f6f8fa' },
        selection: { default: "#0969da33" }
    },
    dark: {
        fg: { default: '#e6edf3', muted: '#7d8590' },
        canvas: { default: '#0d1117' },
        border: { default: '#000', muted: '#3d444d' },
        accent: { fg: '#d2a8ff' },
        link: { fg: '#a5d6ff' },
        header: { title: '#ff7b72', subtitle: '#ffa657' },
        neutral: { subtle: '#151b23' },
        selection: { default: "#1f6febb3" }
    },
};

const generateThemeStyles = (forceDarkMode: boolean): string => forceDarkMode ?
    `
  :root {
    --color-fg-default: ${colors.dark.fg.default};
    --color-fg-muted: ${colors.dark.fg.muted};
    --color-canvas-default: ${colors.dark.canvas.default};
    --color-border-default: ${colors.dark.border.default};
    --color-border-muted: ${colors.dark.border.muted};
    --color-accent-fg: ${colors.dark.accent.fg};
    --color-link-fg: ${colors.dark.link.fg};
    --color-header-title: ${colors.dark.header.title};
    --color-header-subtitle: ${colors.dark.header.subtitle};
    --color-neutral-subtle: ${colors.dark.neutral.subtle};
    --color-selection-default: ${colors.dark.selection.default};
  }
  body {
    color: var(--color-fg-default);
  }
` :
    `
  :root {
    --color-fg-default: ${colors.light.fg.default};
    --color-fg-muted: ${colors.light.fg.muted};
    --color-canvas-default: ${colors.light.canvas.default};
    --color-border-default: ${colors.light.border.default};
    --color-border-muted: ${colors.light.border.muted};
    --color-accent-fg: ${colors.light.accent.fg};
    --color-link-fg: ${colors.light.link.fg};
    --color-header-title: ${colors.light.header.title};
    --color-header-subtitle: ${colors.light.header.subtitle};
    --color-neutral-subtle: ${colors.light.neutral.subtle};
    --color-selection-default: ${colors.light.selection.default};
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --color-fg-default: ${colors.dark.fg.default};
      --color-fg-muted: ${colors.dark.fg.muted};
      --color-canvas-default: ${colors.dark.canvas.default};
      --color-border-default: ${colors.dark.border.default};
      --color-border-muted: ${colors.dark.border.muted};
      --color-accent-fg: ${colors.dark.accent.fg};
      --color-link-fg: ${colors.dark.link.fg};
      --color-header-title: ${colors.dark.header.title};
      --color-header-subtitle: ${colors.dark.header.subtitle};
      --color-neutral-subtle: ${colors.dark.neutral.subtle};
      --color-selection-default: ${colors.dark.selection.default};
    }
    body {
      color: var(--color-fg-default);
    }
  }
`;

const formatTitle = (val: string): string => {
    return val.split(' ').map(s => String(s).charAt(0).toLowerCase() + String(s).slice(1)).join('_')
}

export const reverseFormatTitle = (val: string): string => {
    return val.split('_').map(s => String(s).charAt(0).toUpperCase() + String(s).slice(1)).join(' ')
}

const renderSection = (title: string, content: (Result | string)[] | undefined | null, className: string = ''): Result | null => {
    if (!content || content.length === 0) return null;
    return (
        <section className={`pb-2 border-t-1 border-muted ${className}`}>
            <div className="flex pl-1 hidden-open-bracket">
                <h2 className="hidden-equal subtitle" title={title}>
                    {formatTitle(title)}
                </h2>
            </div>
            {content}
            <span aria-hidden="true" className="hidden-close-bracket"></span>
        </section>
    );
};

const renderHighlights = (highlights: string[] | undefined): Result | null => {
    if (!highlights || highlights.length === 0) return null;
    return (
        <ul className="list-equals list-inside pl-2">
            {highlights.map(highlight => <li>{highlight}</li>)}
        </ul>
    );
};

const embedImage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const mimeType = response.headers.get('content-type');
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
};

const renderBasics = async (basics: Resume['basics'], className: string = ''): Promise<Result> => {
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

    if (!basics) return <section className={`pb-2 border-t-1 border-muted ${className}`}></section>;
    return (
        <section className={`pb-2 border-t-1 border-muted ${className}`}>
            <div className="flex">
                {basics.image && (
                    <picture>
                        <source srcset={await embedImage(basics.image)} />
                        <img
                            className="w-30 min-w-30 h-30 rounded-2xl ml-1 my-1"
                            src={basics.image}
                            alt={`A portrait of ${basics.name}`}
                        />
                    </picture>
                )}
                <div className="px-1 text-center m-auto overflow-hidden">
                    {basics.name && (
                        <span style="font: italic 12px monospace;line-height: 12px;" aria-label={basics.name} className="text-accent whitespace-pre mt-1">
                            <pre aria-hidden="true" style="user-select: none;">
                                <code className="language-figlet">
                                    {await figlet.text(basics.name, { font: "Tmplr" })}
                                </code>
                            </pre>
                            <h1 className="name">{basics.name}</h1>
                        </span>
                    )}
                    {basics.label && <h4 className="text-muted -mt-1">{basics.label}</h4>}
                </div>
            </div>
            <address className="not-italic mx-2">
                {basics.location && <p>{`${basics.location.city}, ${basics.location.region}`.trim()}</p>}
            </address>
            {basics.email && (
                <p className="mx-2 text-accent">
                    {raw(
                        <svg height="16" width="16" viewBox="0 0 24 24" color="currentColor" className="inline mr-1" xmlns="http://www.w3.org/2000/svg">
                            {{ type: 'raw', value: pixel.icons.envelope.body }}
                        </svg>
                    )}
                    <a className="link" href={`mailto:${basics.email}`}>{basics.email}</a>
                </p>
            )}
            {basics.url && (
                <p className="mx-2 text-accent">
                    {raw(
                        <svg height="16" width="16" viewBox="0 0 24 24" color="currentColor" className="inline mr-1" xmlns="http://www.w3.org/2000/svg">
                            {{ type: 'raw', value: pixel.icons.globe.body }}
                        </svg>
                    )}
                    <a className="link" href={basics.url} target="_blank">{basics.url}</a>
                </p>
            )}
            {basics.profiles && (
                <div className="mx-2 text-accent">
                    {basics.profiles.map(profile =>
                        profile.network && (
                            <p>
                                {raw(
                                    <svg height="16" width="16" viewBox="0 0 24 24" color="currentColor" className="inline mr-1" xmlns="http://www.w3.org/2000/svg">
                                        {{ type: 'raw', value: profileIcons[profile.network]! }}
                                    </svg>
                                )}
                                {profile.url ? (
                                    <a className="link" href={profile.url} target="_blank">{`${profileName[profile.network]!(profile.username!)}`}</a>
                                ) : (
                                    `${profileName[profile.network]!(profile.username!)}`
                                )}
                            </p>
                        )
                    )}
                </div>
            )}
        </section>
    );
};

const renderWork = (work: Resume['work']) =>
    work?.map(job => (
        <div className="item ml-4 mr-2">
            <div className="flex justify-between items-baseline">
                <h3 className="title">{job.name}</h3>
                {(job.startDate || job.endDate) && (
                    <p className=" min-w-fit ml-6">
                        <time dateTime={job.startDate} className="text-accent">{job.startDate}</time>
                        <span className="text-muted"> til </span>
                        <time dateTime={job.endDate} className="text-accent">{job.endDate ?? 'Present'}</time>
                    </p>
                )}
            </div>
            {job.position && <h4 className="text-muted">{job.position}</h4>}
            {job.summary && <p>{job.summary}</p>}
            {renderHighlights(job.highlights)}
        </div>
    ));

const renderProjects = (projects: Resume['projects']) =>
    projects?.map(project => (
        <div className="item ml-4 mr-2">
            <div className="flex justify-between items-baseline">
                <h3 className="title">{project.name}</h3>
                {project.url && <a title="View Project" className="link " href={project.url} target="_blank">view_project</a>}
            </div>
            {project.keywords && <h4 className=" text-muted">{`Technologies: ${project.keywords.join(', ')}`}</h4>}
            {project.description && <p>{project.description}</p>}
            {renderHighlights(project.highlights)}
        </div>
    ));

const renderSkills = (skills: Resume['skills']) =>
    skills?.map(skill => (
        <div className="item ml-4 mr-2">
            {skill.name && <h3 className="title">{skill.name}</h3>}
            {skill.level && <h4 className="text-muted">{`Level: ${skill.level}`}</h4>}
            {skill.keywords && (
                <ul className="flex flex-wrap gap-1 hidden-open-bracket-square hidden-close-bracket-square">
                    {skill.keywords.map(keyword => (
                        <li className="hidden-comma">
                            <span className="bg-subtle  font-medium px-2 rounded">{keyword}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    ));

const renderAwards = (awards: Resume['awards']) =>
    awards?.map(award => (
        <div className="item ml-4 mr-2">
            <div className="flex justify-between items-baseline">
                <h3 className="title">{award.title}</h3>
                {award.date && <p className=" text-muted">{award.date}</p>}
            </div>
            {award.awarder && <p>{`Awarded by: ${award.awarder}`}</p>}
            {award.summary && <p>{award.summary}</p>}
        </div>
    ));

const renderCertificates = (certificates: Resume['certificates']) =>
    certificates?.map(cert => (
        <div className="item ml-4 mr-2">
            <div className="flex justify-between items-baseline">
                <h3 className="title">{cert.name}</h3>
                {cert.url && <p><a title="View Certificate" className="link" href={cert.url} target="_blank">view_certificate</a></p>}
            </div>
            {cert.issuer && <h4 className="text-muted">{`Issuer: ${cert.issuer}`}</h4>}
        </div>
    ));

const renderPublications = (publications: Resume['publications']) =>
    publications?.map(pub => (
        <div className="item ml-4 mr-2">
            <div className="flex justify-between items-baseline">
                <h3 className="title">{pub.name}</h3>
                {pub.releaseDate && <p className=" text-muted">{pub.releaseDate}</p>}
            </div>
            {pub.publisher && <p>{`Publisher: ${pub.publisher}`}</p>}
            {pub.summary && <p>{pub.summary}</p>}
            {pub.url && <p><a title="Read Publication" className="link" href={pub.url} target="_blank">read_publication</a></p>}
        </div>
    ));

const renderHeader = (className: string = 'header-area') =>
    <header className={`h-[32px] pt-[4px] bg-subtle rounded-t-lg border-muted flex items-center justify-between ${className}`}>
        <div className="flex items-center">
            {raw(
                <svg className="ml-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">{{ type: 'raw', value: pixel.icons['code-solid'].body }}</svg>
            )}
            <p className="ml-2 select-none">Resume</p>
        </div>
        <div className="relative inline-block mr-2">
            <input type="checkbox" id="menu-toggle" className="hidden" />
            <label htmlFor="menu-toggle" className="cursor-pointer">
                <div className="w-6 h-6 mb-1 pl-2 flex flex-col justify-center rounded-md items-center border-muted border-1 inset-shadow-sm">
                    {raw(
                        <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">{{ type: 'raw', value: pixel.icons['ellipses-horizontal-solid'].body }}</svg>
                    )}
                </div>
            </label>
            <label htmlFor="menu-toggle" class="page-overlay"></label>
            <ul className="menu absolute -right-2 py-2 w-48 bg-canvas rounded-lg border-muted border-1 shadow-2xl z-20 hidden">
                <a href="/" type="application/pdf" download="resume.pdf"><li className="pl-1">Download PDF</li></a>
                <a href="/" type="text/html" download="resume.html"><li className="pl-1">Download HTML</li></a>
                {/* <a href="/" type="text/markdown" download="resume.md"><li className="pl-1">Download Markdown</li></a> */}
            </ul>
        </div>
    </header>

const renderFooter = (className: string = 'footer-area') =>
    <footer className={`pb-2 border-t-1 border-muted ${className}`}>
        <div className="flex pl-2">
            <p className="text-muted">This resume was generated from code <a className="link" href="https://github.com/dylanlangston/Resume" target="_blank">available here</a></p>
        </div>
    </footer>

type ThemeConfig = {
    resume: Resume,
    consoleMessage?: string,
    forceDarkMode?: boolean;
    hideHeader?: boolean;
}

const Theme = async (config: ThemeConfig): Promise<Result> => {
    const {
        basics,
        work,
        awards,
        certificates,
        publications,
        skills,
        projects,
    } = config.resume;

    const headerSection = renderHeader('header-area');
    const basicSection = await renderBasics(basics, 'basics-area');
    const aboutSection = basics?.summary ? renderSection('About', [<p className="ml-4 mr-2">{basics.summary}</p>], 'about-area') : null;
    const workSection = renderSection('Work Experience', renderWork(work), 'work-area');
    const projectsSection = renderSection('Projects', renderProjects(projects), 'projects-area');
    const awardsSection = renderSection('Awards', renderAwards(awards), 'awards-area');
    const certificatesSection = renderSection('Certificates', renderCertificates(certificates), 'certificates-area');
    const publicationsSection = renderSection('Publications', renderPublications(publications), 'publications-area');
    const skillsSection = renderSection('Skills', renderSkills(skills), 'skills-area');
    const footerSection = renderFooter('footer-area');

    return (
        <>
            {{ type: 'doctype' } as Doctype}
            <html lang="en" className="p-2">
                <head>
                    <meta charSet="utf-8" />
                    <meta http-equiv="Content-Security-Policy" content="default-src 'self' mailto:; style-src 'self' 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self' data:;" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <meta name="description" content={basics?.summary ?? 'Resume'} />
                    <link rel="icon" type="image/svg+xml" href={`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="white"/>${pixel.icons['code-solid'].body}</svg>`} />
                    <title>{basics?.name ? `${basics.name}'s Resume` : 'Resume'}</title>
                    <style>{fonts}</style>
                    <style>{styles}</style>
                    <style>{generateThemeStyles(Boolean(config.forceDarkMode))}</style>
                </head>
                <body className="leading-normal opacity-0 animate-[fadeIn_500ms_ease-out_forwards] bg-canvas max-w-screen-2xl border-1 border-muted rounded-lg m-auto">
                    {Boolean(config.hideHeader) ?  null : headerSection}
                    <main className="grid-container rounded-lg">
                        {basicSection}
                        {aboutSection}
                        {workSection}
                        {projectsSection}
                        {awardsSection}
                        {certificatesSection}
                        {publicationsSection}
                        {skillsSection}
                        {footerSection}
                    </main>
                    {config.consoleMessage ? <script>
                        console.log(`{config.consoleMessage}`)
                    </script> : null}
                </body>
            </html>
        </>
    );
};

export default Theme;