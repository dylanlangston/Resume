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
	@cp ./out/professional.pdf ./dist/professional.pdf
	@cp ./out/resume.html ./dist/resume.html
	@cp ./out/resume.md.html.pdf ./dist/resume.md.html.pdf

preview: ## Preview the resume in the browser.
	@cd ./src; bun run preview

update-readme-screenshot: ## Update the README screenshot.
	@pdftoppm -png -singlefile -r 200 ./dist/resume.pdf screenshot
	@convert screenshot.png -define webp:lossless=true screenshot.webp
	@rm screenshot.png

update-readme-screenshot-docker: ## Update the README screenshot using docker.
	@docker build --rm --network=host --progress=plain -t resume . --target update_screenshot --output type=local,dest=$(OUTPUT_DIR)
	@cp -f $(OUTPUT_DIR)/screenshot.webp ./screenshot.webp

create-social-preview: ## Generate an image to use for the github social preview.
	@pdftoppm -singlefile -cropbox -scale-to-x 1160 -W 1200 -H 640 -png ./dist/resume.pdf | convert png:- \
	-background white \
	-gravity east \
	-splice 60x0 \
	-gravity west \
	-splice 60x0 \
	social-preview.png