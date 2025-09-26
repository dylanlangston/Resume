<h1 align="center"><a href="./dist/resume.md.html.pdf"><img alt="My Resume" src="./screenshot.webp" /></a></h1>
<a href="https://api.github.com/repos/dylanlangston/Resume"><img alt="GitHub repo size" src="https://img.shields.io/github/repo-size/dylanlangston/Resume?label=Repo%20Size"></a>
</p>

This repository contains the source code used to build my resume. The resume is generated from a `resume.json` file that follows the [JSON Resume standard](https://jsonresume.org/) and which is hosted as a [GitHub Gist](https://gist.github.com/dylanlangston/80380ec68b970189450dd2fae4502ff1). The build process generates a single polyglot file that is simultaneously a valid PDF, HTML, and Markdown document and hosts it on https://resume.dylanlangston.com/

This project uses [Bun](https://bun.sh/), [TypeScript](https://www.typescriptlang.org/), [resumed](https://github.com/rbardini/resumed), [hastscript](https://github.com/syntax-tree/hastscript) and [Tailwind CSS](https://tailwindcss.com/) to name a few.

## Getting Started

### Prerequisites

To build and run this project locally, you will need to have the following installed:

-   [Bun](https://bun.sh/)
-   [Docker](https://www.docker.com/) or equivalent (for the Docker-based build)

### Makefile Commands

A `Makefile` is included to streamline common tasks.

| Command | Description |
| ---- | ---- |
| `build-docker` | Build the resume using docker. | 
| `build` | Build the resume PDF. | 
| `create-social-preview` | Generate an image to use for the github social preview. |
| `help` | Display the help menu. | 
| `preview` | Preview the resume in the browser. |
| `release` | Release the build artifacts. |
| `setup-git-clone` | Clone git submodules. |
| `setup` | Setup the development environment. |
| `update-readme-screenshot` | Update the README screenshot. |
| `update-readme-screenshot-docker` | Update the README screenshot using docker. |

### Dev Container

This project includes a [Dev Container](https://code.visualstudio.com/docs/remote/containers), which allows you to open the project in a pre-configured development environment using VS Code. This is the recommended way to work on this project, as it ensures all tools and dependencies are set up correctly.
