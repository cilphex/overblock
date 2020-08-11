# 02: lnd

The next microservice to get up and running is the Lightning node, `lnd`. The
setup is very similar to `btcd`, but there will be a little more to the setup
stage when we run it for the first time.

1. [Overview](#Overview)
    1. [Dockerfile](#Dockerfile)
    2. [Docker Compose](#DockerCompose)
    3. [Environment](#Environment)
    4. [Startup Script](#StartupScript)
    5. [Command Line](#CommandLine)
2. [Running in Development](#RunningInDevelopment)
3. [Extra Resources](#ExtraResources)

<a name="Overview" />

## 1. Overview

<a name="Dockerfile" />

### 1.1 Dockerfile

<a name="DockerCompose" />

### 1.2 Docker Compose

<a name="Environment" />

### 1.3 Environment

<a name="StartupScript" />

### 1.4 Startup Script (start-lnd.sh)

> _Question: It looks looks like you can create an `lnd.conf` file to specify
runtime parameters. Why not use one?_
>
> Answer: Some of the parameters rely on env vars, which can be utilized through
> a script, but not through a config file. It's nice to keep all of the flags in
the same location so they're easier to see at a glance. So they're all put in
the startup script rather than having some flags in the startup script and some
in an `lnd.conf` file.

<a name="CommandLine" />

### 1.5 Command Line

<a name="RunningInDevelopment" />

## 2. Running in Development

Run this to build the `lnd` container:

```shell script
docker-compose build lnd
```

<a name="ExtraResources" />

## 3. Extra Resources

The [lnd INSTALL doc](https://github.com/lightningnetwork/lnd/blob/master/docs/INSTALL.md)
is a great place to get more detail or dive deeper.

