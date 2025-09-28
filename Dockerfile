FROM debian:stable-slim AS base
USER root

WORKDIR /root/

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
     && apt-get -y install --no-install-recommends ca-certificates bash curl unzip xz-utils git make zip chromium fonts-liberation poppler-utils

COPY ./src/package.json /root/src/package.json
COPY ./src/bun.lock /root/src/bun.lock

SHELL ["/bin/bash", "-lc"]

RUN curl -L --proto '=https' --tlsv1.3 -sSf https://bun.sh/install | bash

FROM base AS build
COPY . /root/
RUN make build release

FROM scratch AS publish
COPY --from=build /root/dist /