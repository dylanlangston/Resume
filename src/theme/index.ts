import { h } from 'hastscript';
import { toHtml } from 'hast-util-to-html';

type Resume = {
  basics?: {
    name?: string;
    label?: string;
    summary?: string;
    location?: {
      city?: string;
      countryCode?: string;
    };
    email?: string;
    phone?: string;
    url?: string;
    profiles?: {
      network?: string;
      username?: string;
      url?: string;
    }[];
  };
};

const render = (resume: Resume): string => {
  const { basics } = resume;

  if (!basics || !basics.location || !basics.profiles) {
    throw new Error("Resume 'basics' section is required.");
  }

  const tree = h('html', { lang: 'en' }, [
    h('head', [
      h('meta', { charSet: 'utf-8' }),
      h('title', basics.name),
    ]),
    h('body', [
      h('h1', basics.name),
      h('h2', basics.label),
      h('p', basics.summary),
      h('ul', [
        h('li', `${basics.location.city} ${basics.location.countryCode}`),
        h('li', [h('a', { href: `mailto:${basics.email}` }, basics.email)]),
        h('li', [h('a', { href: basics.url }, basics.url)]),
        ...basics.profiles.map(profile =>
          h('li', `${profile.username} (${profile.network})`)
        ),
      ]),
    ]),
  ]);

  return toHtml(tree);
};

export { render };