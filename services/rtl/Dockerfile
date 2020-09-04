FROM node:14.7.0-alpine3.11

# Necessary for git pull and bash is helpful for debut
RUN apk add --no-cache --update \
    alpine-sdk \
    bash \
    git

# Create the app dir and make it the working dir
WORKDIR /app

ARG RTL_REPO=https://github.com/Ride-The-Lightning/RTL.git
ARG RTL_VERSION=v0.9.0

# Pull the git repo to the working dir and install dependencies
RUN git clone $RTL_REPO . \
    && git checkout $RTL_VERSION \
    && npm install --only=prod

# Copy the config from our source to the working dir
COPY ./RTL-Config.json .

# Copy start file and make it executable
COPY ./startup-scripts ./startup-scripts

RUN chmod +x startup-scripts/*