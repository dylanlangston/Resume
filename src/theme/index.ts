import * as resume from "resumed";

type Resume = Parameters<typeof resume.render>[0];

const render = (resume: Resume) => {
    const {basics} = resume;

    if (!basics || !basics.location || !basics.profiles) {
        throw new Error("Resume 'basics' section is required.");
    }

    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${basics.name}</title>
  </head>
  <body>
    <h1>${basics.name}</h1>
    <h2>${basics.label}</h2>
    <p>${basics.summary}</p>
    <ul>
      <li>${basics.location.city} ${basics.location.countryCode}</li>
      <li><a href="mailto:${basics.email}">${basics.email}</a></li>
      <li><a href="tel:${basics.phone}">${basics.phone}</a></li>
      <li><a href="${basics.url}">${basics.url}</a></li>
      ${basics.profiles
        .map(profile => `<li>${profile.username} (${profile.network})</li>`)
        .join('')}
    </ul>
  </body>
</html>
`;
};

export {render}