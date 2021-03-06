# Copied and modified from
# https://github.com/lightningnetwork/lnd/blob/master/docker/lnd/Dockerfile
# with start-lnd.sh location updated
# and the source updated to github

FROM golang:1.13-alpine as builder

# Force Go to use the cgo based DNS resolver. This is required to ensure DNS
# queries required to connect to linked containers succeed.
ENV GODEBUG netdns=cgo

# Install dependencies and install/build lnd.
RUN apk add --no-cache --update \
    alpine-sdk \
    git \
    make

WORKDIR $GOPATH/src/github.com/lightningnetwork/lnd

# Pin down lnd to a version that we trust to work
ARG LND_REPO=https://github.com/lightningnetwork/lnd.git
ARG LND_VERSION=v0.11.0-beta

RUN git clone $LND_REPO . \
    && git checkout $LND_VERSION \
    && make \
    && make install tags="autopilotrpc chainrpc invoicesrpc routerrpc signrpc walletrpc"

# Start a new, final image to reduce size.
FROM alpine as final

# Expose lnd ports (server, rpc).
EXPOSE 9735 10009

# Copy the binaries and entrypoint from the builder image.
COPY --from=builder /go/bin/lncli /bin/
COPY --from=builder /go/bin/lnd /bin/

# Add bash.
RUN apk add --no-cache bash

# Copy start file and make it executable
COPY "start-lnd.dev.sh" .
COPY "start-lnd.prod.sh" .
COPY "zombie-channels.sh" .

RUN chmod +x start-lnd.dev.sh
RUN chmod +x start-lnd.prod.sh
RUN chmod +x zombie-channels.sh
