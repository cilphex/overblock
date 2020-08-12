# 02: lnd

The next microservice to get up and running is the Lightning node, `lnd`. The
setup is very similar to `btcd`.

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

First we'll review what's in the directory before we try running it.

<a name="Dockerfile" />

### 1.1 Dockerfile

Take a look at `services/lnd/Dockerfile`.

You'll see that the Dockerfile basically just sets up a `Go` environment and
then downloads and installs `lnd` from github.

Like the `btcd` Dockerfile, it contains instructions for copying over a custom
script that we'll use to start the `lnd` node within the container:

```dockerfile
COPY "start-lnd.sh" .
```
```dockerfile
RUN chmod +x start-lnd.sh
```

Once again, we'll use this script to start `lnd` inside the container rather
than running `lnd` directly because `btcd` takes a lot of parameters, and it's
easier to list those parameters and include some logic for them from within a
script than at the command line.

<a name="DockerCompose" />

### 1.2 Docker Compose

Take a look at the root-level `docker-compose.yaml`. You can see that
the `lnd` service is the 2nd one listed. Here's the snippet:

```yaml
  lnd:
    image: lnd
    container_name: lnd
    build: ./services/lnd/
    env_file: ./services/lnd/.env.local
    volumes:
      # Notes on what each of these are for are in the `volumes` section below
      - shared_rpc_data:/rpc
      - lightning_dir:/lnd
      - shared_lightning_creds:/shared
    depends_on:
      - btcd
    ports:
      # host:container
      - "9735:9735"    # p2p
      - "10009:10009"  # rpc
    command: ["./start-lnd.sh"]
```







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

Run this command to bring the container up:

```shell script
docker-compose up lnd
```

The container should start and logs from the `lnd` process should start
printing. Take a look at them to see what it's doing. If your `btcd` node is
still syncing, you should see a line like this:

```
Waiting for chain backend to finish sync, start_height=1383532
```

You can use `lnd-cli` to query the lightning node and see its info:

```shell script
# Node information
lnd-cli getinfo
```

```shell script
# Discover other commands
lnd-cli -h
```

Now we're ready to move on to step [03: lnd-gateway](guides/03_lnd-gateway.md).

<a name="ExtraResources" />

## 3. Extra Resources

The [lnd INSTALL doc](https://github.com/lightningnetwork/lnd/blob/master/docs/INSTALL.md)
is a great place to get more detail or dive deeper.

