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

export const reverseFormatTitle = (val: string): string => {
    return val.split('_').map(s => String(s).charAt(0).toUpperCase() + String(s).slice(1)).join(' ')
}

const renderSection = (title: string, content: (Result | string)[] | undefined | null): Result | null => {
    if (!content || content.length === 0) return null;
    return (
        <section className="pb-2 border-t-1 border-muted">
            <div className="flex  pl-1 hidden-open-bracket">
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

const renderBasics = async (basics: Resume['basics']): Promise<Result> => {
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

    if (!basics) return <section className="pb-2 border-t-1 border-muted"></section>;
    return (
        <section className="pb-2 border-t-1 border-muted">
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
                <div className="px-1 text-center m-auto">
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
                <p className="mx-2">
                    {raw(
                        <svg height="16" width="16" viewBox="0 0 24 24" color="#6639ba" className="inline mr-1" xmlns="http://www.w3.org/2000/svg">
                            {{ type: 'raw', value: pixel.icons.envelope.body }}
                        </svg>
                    )}
                    <a className="link" href={`mailto:${basics.email}`}>{basics.email}</a>
                </p>
            )}
            {basics.url && (
                <p className="mx-2">
                    {raw(
                        <svg height="16" width="16" viewBox="0 0 24 24" color="#6639ba" className="inline mr-1" xmlns="http://www.w3.org/2000/svg">
                            {{ type: 'raw', value: pixel.icons.globe.body }}
                        </svg>
                    )}
                    <a className="link" href={basics.url} target="_blank">{basics.url}</a>
                </p>
            )}
            {basics.profiles && (
                <div className="mx-2">
                    {basics.profiles.map(profile =>
                        profile.network && (
                            <p>
                                {raw(
                                    <svg height="16" width="16" viewBox="0 0 24 24" color="#6639ba" className="inline mr-1" xmlns="http://www.w3.org/2000/svg">
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
            {skill.level && <h4 className=" text-muted">{`Level: ${skill.level}`}</h4>}
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
                {cert.date && <p className=" text-muted">{cert.date}</p>}
            </div>
            {cert.issuer && <h4 className="text-muted">{`Issuer: ${cert.issuer}`}</h4>}
            {cert.url && <p><a title="View Certificate" className="link" href={cert.url} target="_blank">view_certificate</a></p>}
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

const Theme = async (resume: Resume): Promise<Result> => {
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
    ].filter(Boolean) as (Result | string)[];

    const rightColumnContent = [
        basics?.summary ? renderSection('About', [<p className="ml-4 mr-2">{basics.summary}</p>]) : null,
        renderSection('Work Experience', renderWork(work)),
        renderSection('Projects', renderProjects(projects)),
        renderSection('Awards', renderAwards(awards)),
        renderSection('Certificates', renderCertificates(certificates)),
        renderSection('Publications', renderPublications(publications)),
    ].filter(Boolean) as (Result | string)[];

    return (
        <>
            {{ type: 'doctype' } as Doctype}
            <html lang="en">
                <head>
                    <meta charSet="utf-8" />
                    <meta http-equiv="Content-Security-Policy" content="default-src 'self' mailto:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; img-src 'self' data:; connect-src 'self' https://www.google-analytics.com; font-src 'self' data:;" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="icon" type="image/svg+xml" href={`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="white"/>${pixel.icons['code-solid'].body}</svg>`} />
                    <title>{basics?.name ? `${basics.name}'s Resume` : 'Resume'}</title>
                    <style>{fonts}</style>
                    <style>{styles}</style>
                    <style>{generateThemeStyles()}</style>
                </head>
                <body className="leading-normal opacity-0 animate-[fadeIn_500ms_ease-out_forwards]">
                    <div className="mx-auto bg-canvas">
                        <div className="md:flex">
                            <div className="w-full md:w-[35%] md:min-w-[380px] min-w-print-0 border-l border-b border-r md:border-r-0 border-muted">{leftColumnContent}</div>
                            <div className="w-full md:w-[65%] border-x border-b border-muted">{rightColumnContent}</div>
                        </div>
                    </div>
                    <script async src="https://www.googletagmanager.com/gtag/js?id=G-2QY59QNZZL"></script>
                    <script>
                        {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());

                        gtag('config', 'G-2QY59QNZZL');
                    `}
                    </script>
                </body>
            </html>
        </>
    );
};

export default Theme;