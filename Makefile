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

build: setup ## Build the resume PDF.
	@bun --cwd ./src build

build-docker: ## Build the Docker image.
	@docker build --rm --network=host --progress=plain -t resume . --target publish --output type=local,dest=$(OUTPUT_DIR)

release: ## Release the build artifacts.
	@cp ./out/resume.md ./dist/resume.md
	@cp ./out/resume.pdf ./dist/resume.pdf

preview: ## Preview the resume in the browser.
	@cd ./src; bun run preview

update-readme-screenshot: ## Update the README screenshot.
	@pdftoppm -png -singlefile -r 300 ./dist/resume.pdf screenshot

create-social-preview: ## Generate an image to use for the github social preview.
	@pdftoppm -singlefile -cropbox -scale-to-x 1160 -W 1200 -H 640 -png ./dist/resume.pdf | convert png:- \
	-background white \
	-gravity east \
	-splice 60x0 \
	-gravity west \
	-splice 60x0 \
	social-preview.png