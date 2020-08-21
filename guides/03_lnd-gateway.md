# 3. lnd-gateway

`lnd-gateway` is a microservice that sets up a small websocket server and uses
it to proxy a limited set of gRPC requests to `lnd`.

1. [Overview](#Overview)
    1. [Dockerfile](#Dockerfile)
    2. [docker-compose](#DockerCompose)
    3. [Environment](#Environment)
    4. [Startup Script](#StartupScript)
    5. [Command Line](#CommandLine)
2. [Running in Development](#RunningInDevelopment)

<a name="Overview" />

## 1. Overview

When we get our website up and running, we're going to want a way to generate
Lightning invoices so that we can display them as a QR code to the user.

Generating the invoice and detecting when we receive a payment for it are
things that happen inside of `lnd`. `lnd` lets you create an invoice and has a
callback for payment detection through its gRPC interface.

But web browsers don't generally make gRPC requests. They make http REST
requests. (GET, POST, that kind of thing.) Browsers also support websockets
for more realtime, 2-way, streaming communication between client and server.

So rather than make the browser try to talk to `lnd` directly, we'd like to
make a little middleman process. This middleman process will let web browsers
connect to it through websockets, will receive their requests for payment
invoice generation, and forward them to `lnd` through gRPC. It will also do the
reverse: listen to `lnd` through its gRPC callback stream and broadcast payment
detection back to the browser through its websocket connection.

In addition to being a translator between websockts and gRPC, having a
middleman service is important because it allows us to keep any gRPC-related
credentials for `lnd` a secret, not exposed to the browser. We can also keep
our `lnd` instance exposed only to our other processes, and not the whole
internet, which is great for security and control.

<a name="Dockerfile" />

### 1.1 Dockerfile

Take a look at `services/lnd-gateway/Dockerfile`.

All this Dockerfile does is set up a node environment, copies the
`package.json` file and installs dependencies, then copies our app files. It
also exposes a port on the container.

<a name="DockerCompose" />

### 1.1 docker-compose

<a name="Environment" />

### 1.1 Environment

<a name="StartupScript" />

### 1.1 Startup Script

<a name="CommandLine" />

### 1.1 Command Line

<a name="RunningInDevelopment" />

## 2. Running in Development

