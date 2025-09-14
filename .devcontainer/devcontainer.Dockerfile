FROM mcr.microsoft.com/devcontainers/base:debian as base

# Install General Dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
     && apt-get -y install --no-install-recommends ca-certificates bash curl unzip xz-utils git make zip chromium

# GIT LFS
RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash \
     && apt-get -y install --no-install-recommends git-lfs

# Install Docker
RUN install -m 0755 -d /etc/apt/keyrings \
     && curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc \
     && chmod a+r /etc/apt/keyrings/docker.asc \
     && echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
     $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
     tee /etc/apt/sources.list.d/docker.list > /dev/null \
     && apt-get update && apt-get -y install --no-install-recommends docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow vscode user to run docker commands without sudo
RUN usermod -aG docker vscode

# Clean Image
RUN apt-get clean && rm -rf /var/cache/apt/* && rm -rf /var/lib/apt/lists/* && rm -rf /tmp/*

# Important we change to the vscode user that the devcontainer runs under
USER vscode
WORKDIR /home/vscode

# Install Bun
RUN curl -L --proto '=https' --tlsv1.3 -sSf https://bun.sh/install | bash