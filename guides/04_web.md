# 4. web

`web` is the frontend of the project. It consists of a small server that will
send a React app to the browser upon request.

1. [Overview](#Overview)
    1. [Dockerfile](#Dockerfile)
    2. [docker-compose](#DockerCompose)
    3. [Environment](#Environment)
    4. [Startup Script](#StartupScript)
    5. [server.js](#ServerJs)
    6. [webpack](#Webpack)
    7. [Command Line](#CommandLine)
2. [Running in Development](#RunningInDevelopment)

<a name="Overview" />

## 1. Overview

`web` is our frontend. You can call it an SPA ("single page app"). It is
comprised of a small server and a React app that the server serves.

`web` talks to `lnd` through `lnd-gateway`. When the web app is loaded in the
browser, it opens a websocket connection to the `lnd-gateway` server. It uses
this connection to generate lightning payment invoices and display them to the
user. It also uses this connection to receive callbacks when payments for these
invoices are detected on the Lightning network, so it can update what's
displayed to the user.

The web app is written in [React](https://reactjs.org/) and compiled using
[webpack](https://webpack.js.org/). I personally found webpack to be pretty
unintuitive and confusing when I first started using it, but it's not the
primary focus of this guide so we'll only cover enough to get things up and
running. Hopefully it's touched on in a way that gives you a little bit of
understanding for an easier time diving deeper on your own.

<a name="Dockerfile" />

### 1.1 Dockerfile

<a name="DockerCompose" />

### 1.2 docker-compose

<a name="Environment" />

### 1.3 Environment

<a name="StartupScript" />

### 1.4 Startup Script

<a name="ServerJs" />

### 1.5 server.js

Open `server.js` and you'll see a very basic http server. It's less than 30
lines of code.

All it does is serve the main app page for all routes without a dot ("."). For
routes with a dot, it assumes it's a file request and will try to serve the
file specified.

The app page and assets are served from the `build` directory because that's
where they're put when the app is compiled. Since the `build` directory is a
result of the build process, it is not checked in, not part of the project
code, and is listed in the `.gitignore` file.

<a name="Webpack" />

### 1.6 webpack

<a name="CommandLine" />

### 1.7 Command Line

<a name="RunningInDevelopment" />

## 2. Running in Development