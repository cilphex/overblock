FROM node:13.13.0-alpine3.10 as builder

RUN apk add --no-cache --update git

WORKDIR /src

ARG RTL_REPO=https://github.com/Ride-The-Lightning/RTL.git
ARG RTL_VERSION=v0.7.0

RUN git clone $RTL_REPO . \
    && git checkout $RTL_VERSION \
    && npm install --only=prod

# No js build step here. Uses angular, not React,
# so just polyfills (I think?), and so no webpack build step

COPY ./RTL-Config.json .

# Start a new, final image to reduce size
FROM node:13.13.0-alpine3.10

# Copy files from builder
COPY --from=builder /src /src

# Starting command that is run will run from here
WORKDIR /src