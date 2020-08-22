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

Take a look at `services/web/Dockerfile`.

This Dockerfile sets up a node environment, copies the app files, and then
installs dependencies.

Note that compared to `lnd-gateway`, there is an additional step: `yarn build`.
This is the step where we build our React files into plain javascript and html
and then stick them into the `build` directory.

Then the Dockerfile exposes a port on the container.

<a name="DockerCompose" />

### 1.2 docker-compose

Let's take a look at the root-level `docker-compose.yaml`, where we'll find an
entry for `web` that looks like this:

```yaml
web:
  image: web
  container_name: web
  build: ./services/web/
  env_file: ./services/web/.env.docker
  ports:
    # host:container
    - "4000:80"
  command: ["yarn", "start:prod"]
```

It looks like we've covered all these parts in previous guides, so we're good
to go.

<a name="Environment" />

### 1.3 Environment

Let's look at `.env.sample`:

```dotenv
PORT=
```

This is our only value, so the env vars for `web` are pretty simple.

Just note that this time around, we don't actually use a `.env.local`. In
development we use the react dev server, which chooses its own port.
`.env.docker` is still used in docker, and we will still need to specify a
`PORT` in our production environment.


<a name="StartupScript" />

### 1.4 Startup Script

In our `docker-compose.yaml` we saw that our startup command is this:

```yaml
command: ["yarn", "start:prod"]
```

We know that this is running the `start:prod` script from our `package.json`,
so let's look at that.

```json
"start:prod": "babel-node server.js"
```

Like with `lnd-gateway`, we're just running our server, as processed through
babel so we can use some modern but not-yet-supported-in-node-by-default
javascript language features.

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

For our server to serve files from `build`, our app files need to be compiled
and put in there first. That's what Webpack does - it's a tool for compiling
our project.

Webpack is extremely flexible and can do lots of fancy things. It can turn sass
into css. It can resize your .png files and move them from /src to /dest,
skipping ones with "-test" in the name. It can probably compile your cat into a
toaster and ship it to Mars.

Each of these things can be done with modules and plugins specific to the task.
So if somebody can make a module or plugin to do... I guess basically anything
in javascript, it can be put into a webpack pipeline and applied to your files.

In our case, we just want to use it to transform React files into regular html
and javascript, and put the result into the `/build` directory.

In the `webpack.common.js` we set up the configuration for doing that. This
file itself is used in `webpack.dev.js` and `webpack.prod.js`. These files add
some environment-specific build steps.

Using webpack to build our React app into flat js and html files happens in 3
places:

1. In development, running the webpack dev server with `yarn start:dev` builds
   our app and serves it up immediately. In this case it does _not_ put the 
   built files into `/build`, and I guess stores them in a temporary location
   decided by webpack.
2. In development, we provide a script for building and then serving with our
   `server.js` instead of the webpack dev server. That's `yarn start:flat`.
   `yarn start:flat` basically just calls the build step and then calls
   `yarn start:prod`, which calls server.js. `yarn start:prod` is the same
   command we use in our container to serve files in production.
3. You could also use any other server software to serve up the built flat app
   files. For example, you could install the `http-server` npm module locally.
   Then you could run `yarn build` to build the app, then navigate into the
   `build` directory and run `http-server .`. Then you'll be able to view the
   app at localhost:8080, as served by http-server instead of server.js.
4. In production, the building of the web app happens in the Dockerfile, where
   you can see the line `yarn start:build`.
   
> 🤔 What's the difference between using the webpack dev server in development
rather than server.js?
>
> The webpack dev server can be faster for testing, because when the webpack
dev server is running, it will detect changes to the code and apply them in 
realtime. You might have to refresh to see the changes, but that's still better
than having to re-build the app and restart the server to see changes
reflected.
>
> The webpack dev server also theoretically supports in-place hot reloading,
though I haven't figured out how to make it work.

> 🤔 If you can use a prebuilt server like http-server to serve the app, why not
just use that rather than a custom server.js?
>
> The actual reason is that at the time this code was written, [http-server could
not work in Google Cloud Run](https://github.com/http-party/http-server/issues/615).
Otherwise, I would have gone that way to reduce custom code. It is a tradeoff
though. In exchange, we know exactly how our server code works and that it's as
minimal as possible.

<a name="CommandLine" />

### 1.7 Command Line

There is no command line for `web`. Like `lnd-gateway`, it is not complicated
enough to justify one, and since the successful output is a web app anyway, we
just interact with it through the browser.

<a name="RunningInDevelopment" />

## 2. Running in Development