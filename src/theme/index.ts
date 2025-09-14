import { type Element } from 'hast'
import { h } from 'hastscript';
import { toHtml } from 'hast-util-to-html';
import {toMdast} from 'hast-util-to-mdast'
import {toMarkdown} from 'mdast-util-to-markdown'
import styles from './styles.css' assert { type: 'text' };
import * as resumed from "resumed";
import tailwindScript from "./node_modules/@tailwindcss/browser/dist/index.global.js" assert { type: "text" };

type Resume = Parameters<typeof resumed.render>[0];

const renderSection = (title: string, content: (Element | string)[] | undefined): Element | null => {
  if (!content || content.length === 0) {
    return null;
  }
  return h('section', { className: 'my-8 break-before-page' }, [
    h('h2', { className: 'text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4' }, title),
    ...content
  ]);
};

const renderHighlights = (highlights: string[] | undefined): Element | null => {
  if (!highlights || highlights.length === 0) {
    return null;
  }
  return h('ul', { className: 'list-disc list-inside mt-2' },
    highlights.map(highlight => h('li', highlight))
  );
};

const getTree = (resume: Resume) => {
  const {
    basics,
    work,
    volunteer,
    education,
    awards,
    certificates,
    publications,
    skills,
    languages,
    interests,
    references,
    projects,
  } = resume;

  const tree = h('html', { lang: 'en' }, [
    h('head', [
      h('meta', { charSet: 'utf-8' }),
      h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      h('title', basics?.name ? `${basics.name}'s Resume` : 'Resume'),
      h('style', styles),
      h('script', [], tailwindScript)
    ]),
    h('body', { className: 'leading-normal text-gray-800 text-sm' }, [
      h('div', { className: 'max-w-4xl mx-auto bg-white p-6' }, [

        basics && h('header', { className: 'text-center mb-6' }, [
          basics.image && h('img', { 
            className: 'w-32 h-32 rounded-full mx-auto mb-3', 
            src: basics.image, 
            alt: `A portrait of ${basics.name}` 
          }),
          basics.name && h('h1', { className: 'text-3xl font-bold text-gray-900' }, basics.name),
          basics.label && h('p', { className: 'text-lg text-gray-600 mt-1' }, basics.label),
          basics.summary && h('p', { className: 'mt-2 text-gray-700 text-base' }, basics.summary),
          h('address', { className: 'not-italic mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-gray-600' }, [
            basics.location && h('div', [
              basics.location.city,
              basics.location.region,
            ].filter(Boolean).join(', ')),
            basics.email && h('div', [h('a', { className: 'text-blue-600 hover:underline', href: `mailto:${basics.email}` }, basics.email)]),
            basics.phone && h('div', basics.phone),
            basics.url && h('div', [h('a', { className: 'text-blue-600 hover:underline', href: basics.url, target: '_blank', rel: 'noopener noreferrer' }, basics.url)]),
          ]),
          basics.profiles && h('ul', { className: 'flex justify-center gap-4 mt-3 list-none p-0' }, basics.profiles.map(profile =>
            h('li', [
              profile.url ? h('a', { className: 'text-blue-600 hover:underline', href: profile.url, target: '_blank', rel: 'noopener noreferrer' }, `${profile.network}`) :
              `${profile.username} on ${profile.network}`
            ])
          )),
        ]),

        renderSection('Work Experience', work?.map(job =>
          h('.work-item', { className: 'mb-4' }, [
            job.name && h('h3', { className: 'text-lg font-semibold' }, job.name),
            job.position && h('h4', { className: 'text-base text-gray-800' }, job.position),
            (job.startDate || job.endDate) && h('p', { className: 'text-xs text-gray-500' }, `${job.startDate || ''} - ${job.endDate || 'Present'}`),
            job.summary && h('p', { className: 'mt-1' }, job.summary),
            renderHighlights(job.highlights),
          ])
        )),

        renderSection('Volunteer', volunteer?.map(item =>
          h('.volunteer-item', { className: 'mb-4' }, [
            item.organization && h('h3', { className: 'text-lg font-semibold' }, item.organization),
            item.position && h('h4', { className: 'text-base text-gray-800' }, item.position),
            (item.startDate || item.endDate) && h('p', { className: 'text-xs text-gray-500' }, `${item.startDate || ''} - ${item.endDate || 'Present'}`),
            item.summary && h('p', { className: 'mt-1' }, item.summary),
            renderHighlights(item.highlights),
          ])
        )),
        
        renderSection('Projects', projects?.map(project =>
          h('.project-item', { className: 'mb-4' }, [
            project.name && h('h3', { className: 'text-lg font-semibold' }, project.name),
            project.description && h('p', { className: 'mt-1' }, project.description),
            project.url && h('p', [h('a', { className: 'text-blue-600 hover:underline text-xs', href: project.url, target: '_blank', rel: 'noopener noreferrer' }, project.url)]),
            renderHighlights(project.highlights),
            project.keywords && h('p', { className: 'mt-1 text-xs text-gray-600' }, `Technologies: ${project.keywords.join(', ')}`),
          ])
        )),

        renderSection('Education', education?.map(edu =>
          h('.education-item', { className: 'mb-4' }, [
            edu.institution && h('h3', { className: 'text-lg font-semibold' }, edu.institution),
            edu.studyType && edu.area && h('h4', { className: 'text-base text-gray-800' }, `${edu.studyType}, ${edu.area}`),
            (edu.startDate || edu.endDate) && h('p', { className: 'text-xs text-gray-500' }, `${edu.startDate || ''} - ${edu.endDate || 'Present'}`),
            edu.score && h('p', `GPA: ${edu.score}`),
            edu.courses && h('div', [h('h5', { className: 'font-semibold mt-1' }, 'Relevant Courses'), h('ul', { className: 'list-disc list-inside text-sm' }, edu.courses.map(course => h('li', course)))])
          ])
        )),

        renderSection('Skills', skills?.map(skill =>
          h('.skill-item', { className: 'mb-4' }, [
            skill.name && h('h3', { className: 'text-lg font-semibold' }, skill.name),
            skill.level && h('p', { className: 'text-xs text-gray-600' }, `Level: ${skill.level}`),
            skill.keywords && h('ul', { className: 'flex flex-wrap gap-1 mt-1' }, 
              skill.keywords.map(keyword => h('li', { className: 'bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded' }, keyword))
            ),
          ])
        )),

        renderSection('Awards', awards?.map(award =>
          h('.award-item', { className: 'mb-4' }, [
            award.title && h('h3', { className: 'text-lg font-semibold' }, award.title),
            award.awarder && h('p', { className: 'text-base' }, `Awarded by: ${award.awarder}`),
            award.date && h('p', { className: 'text-xs text-gray-500' }, `Date: ${award.date}`),
            award.summary && h('p', { className: 'mt-1' }, award.summary),
          ])
        )),

        renderSection('Certificates', certificates?.map(cert =>
          h('.certificate-item', { className: 'mb-4' }, [
            cert.name && h('h3', { className: 'text-lg font-semibold' }, cert.name),
            cert.issuer && h('p', `Issuer: ${cert.issuer}`),
            cert.date && h('p', { className: 'text-xs text-gray-500' }, `Date: ${cert.date}`),
            cert.url && h('p', [h('a', { className: 'text-blue-600 hover:underline', href: cert.url, target: '_blank', rel: 'noopener noreferrer' }, 'View Certificate')]),
          ])
        )),
        
        renderSection('Publications', publications?.map(pub =>
          h('.publication-item', { className: 'mb-4' }, [
            pub.name && h('h3', { className: 'text-lg font-semibold' }, pub.name),
            pub.publisher && h('p', `Publisher: ${pub.publisher}`),
            pub.releaseDate && h('p', { className: 'text-xs text-gray-500' }, `Date: ${pub.releaseDate}`),
            pub.url && h('p', [h('a', { className: 'text-blue-600 hover:underline', href: pub.url, target: '_blank', rel: 'noopener noreferrer' }, 'Read Publication')]),
            pub.summary && h('p', { className: 'mt-1' }, pub.summary),
          ])
        )),

        renderSection('Languages', languages?.map(lang =>
          h('.language-item', { className: 'mb-1' }, [
              lang.language && h('p', [
                h('span', { className: 'font-semibold' }, `${lang.language}: `),
                h('span', `${lang.fluency}`)
              ]),
          ])
        )),
        
        renderSection('Interests', interests?.map(interest =>
          h('.interest-item', { className: 'mb-4' }, [
            interest.name && h('h3', { className: 'text-lg font-semibold' }, interest.name),
            interest.keywords && h('ul', { className: 'flex flex-wrap gap-1 mt-1' }, 
              interest.keywords.map(keyword => h('li', { className: 'bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded' }, keyword))
            ),
          ])
        )),

        renderSection('References', !!references?.length ? references.map(ref => 
          h('.interest-item', { className: 'mb-4' }, [
            ref.name && h('h3', { className: 'text-lg font-semibold' }, ref.name),
          ])
        ) : [h('p','Available upon request.')]),

      ].filter(Boolean) as (Element | string)[])
    ])
  ]);

  return tree;
};

const render = (resume: Resume): string => {
  const tree = getTree(resume);

  return toHtml(tree);
};

const renderMarkdown = (resume: Resume): string => {
  const tree = getTree(resume);
  const mdast = toMdast(tree, { handlers: {} });
  return toMarkdown(mdast);
}

export { render, renderMarkdown, type Resume };