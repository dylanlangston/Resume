<h1 align="center"><a href="./dist/resume.pdf">My Resume</a></h1>
<p align="center">
  <a href="https://github.com/dylanlangston/Resume/actions/workflows/Build.yaml"><img alt="GitHub Workflow CI/CD" src="https://img.shields.io/github/actions/workflow/status/dylanlangston/Resume/Build.yaml?label=CI%2FCD"></a>
  <a href="https://github.com/dylanlangston/Resume/blob/main/LICENSE"><img alt="GitHub License" src="https://img.shields.io/github/license/dylanlangston/dylanlangston.com?label=License"></a>
  <a href="https://api.github.com/repos/dylanlangston/Resume"><img alt="GitHub repo size" src="https://img.shields.io/github/repo-size/dylanlangston/Resume?label=Repo%20Size"></a>
</p>

This repository contains the source code used to build my resume. The resume is generated as a PDF from a `resume.json` file that follows the [JSON Resume standard](https://jsonresume.org/) and which is hosted as a [GitHub Gist](https://gist.github.com/dylanlangston/80380ec68b970189450dd2fae4502ff1).

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
| `build-docker` | Build the Docker image. | 
| `build` | Build the resume PDF. | 
| `help` | Display the help menu. | 
| `preview` | Preview the resume in the browser. |
| `setup-git-clone` | Clone git submodules. |
| `setup` | Setup the development environment. | 

### Dev Container

This project includes a [Dev Container](https://code.visualstudio.com/docs/remote/containers), which allows you to open the project in a pre-configured development environment using VS Code. This is the recommended way to work on this project, as it ensures all tools and dependencies are set up correctly.
