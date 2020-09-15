# Copied and modified from
# https://github.com/lightningnetwork/lnd/blob/master/docker/btcd/Dockerfile
# with start-btcctl.sh lines commented out

FROM golang:1.13-alpine as builder

# Install build dependencies such as git and glide.
RUN apk add --no-cache \
    git \
    gcc \
    musl-dev

WORKDIR $GOPATH/src/github.com/btcsuite/btcd

# Pin down btcd to a version that we know works with lnd.
ARG BTCD_REPO=https://github.com/btcsuite/btcd.git
ARG BTCD_VERSION=v0.21.0-beta

# Grab and install the latest version of of btcd and all related dependencies.
RUN git clone $BTCD_REPO . \
    && git checkout $BTCD_VERSION \
    && GO111MODULE=on go install -v . ./cmd/...

# Start a new image
FROM alpine as final

# Expose mainnet ports (server, rpc)
EXPOSE 8333 8334

# Expose testnet ports (server, rpc)
EXPOSE 18333 18334

# Expose simnet ports (server, rpc)
EXPOSE 18555 18556

# Expose segnet ports (server, rpc)
EXPOSE 28901 28902

# Copy the compiled binaries from the builder image.
COPY --from=builder /go/bin/addblock /bin/
COPY --from=builder /go/bin/btcctl /bin/
COPY --from=builder /go/bin/btcd /bin/
COPY --from=builder /go/bin/findcheckpoint /bin/
COPY --from=builder /go/bin/gencerts /bin/

# Add bash.
RUN apk add --no-cache \
    bash \
    ca-certificates

# Copy start files and make them executable
COPY "start-btcd.dev.sh" .
COPY "start-btcd.prod.sh" .

RUN chmod +x start-btcd.dev.sh
RUN chmod +x start-btcd.prod.sh

# btcd will sometimes complain if this file does not exist
RUN mkdir ~/.btcd
RUN touch ~/.btcd/btcd.conf
