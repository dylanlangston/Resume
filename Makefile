SHELL=/bin/bash

ifeq ($(OUTPUT_DIR),)
	OUTPUT_DIR = './dist'
endif

help: ## Display the help menu.
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

setup: ## Setup the development environment.
	@cd ./src/theme; bun install
	@cd ./src; bun install

build: setup ## Build the resume PDF.
	@bun --cwd ./src build

build-docker: ## Build the Docker image.
	@docker build --rm --network=host --progress=plain -t resume . --target publish --output type=local,dest=$(OUTPUT_DIR)

preview: ## Preview the resume in the browser.
	@cd ./src; bun run preview
