SHELL=/bin/bash

ifeq ($(OUTPUT_DIR),)
	OUTPUT_DIR = './out'
endif

help: ## Display the help menu.
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

setup: setup-git-clone ## Setup the development environment.
	@cd ./src/theme; bun install
	@cd ./src; bun install

setup-git-clone: ## Clone git submodules.
	@git submodule update --init --recursive

build: setup ## Build the resume.
	@bun --cwd ./src build

build-docker: ## Build the resume using docker.
	@docker build --rm --network=host --progress=plain -t resume . --target publish --output type=local,dest=$(OUTPUT_DIR)

release: ## Release the build artifacts.
	@mkdir -p ./dist
	@cp ./out/resume.txt ./dist/resume.txt
	@cp ./out/resume.md ./dist/resume.md
	@cp ./out/resume.pdf ./dist/resume.pdf
	@cp ./out/resume_dark.pdf ./dist/resume_dark.pdf
	@cp ./out/professional.pdf ./dist/professional.pdf
	@cp ./out/resume.html ./dist/resume.html
	@cp ./out/resume.md.html.pdf ./dist/resume.md.html.pdf
	@cp ./out/resume_dark.md.html.pdf ./dist/resume_dark.md.html.pdf
	@cp ./out/screenshot.webp ./screenshot.webp
	@cp ./out/screenshot_dark.webp ./screenshot_dark.webp

preview: ## Preview the resume in the browser.
	@cd ./src; bun run preview