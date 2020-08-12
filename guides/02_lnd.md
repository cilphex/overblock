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

We've covered what most of these sections are for in the previous page for
[btcd](01_btcd.md). Let's just cover the new ones:

```yaml
depends_on:
  - btcd
```

This means: When I run `docker-compose up lnd`, make sure that the `btcd`
container is already running. If it isn't, bring it up before bringing up
`lnd`.

```yaml
ports:
  # host:container
  - "9735:9735"    # p2p
  - "10009:10009"  # rpc
```

This means: Make these ports available outside of the container. Port `9735` in
the container should be mapped to port `9735` in the host environment. Same for
port `10009`.

<a name="Environment" />

### 1.3 Environment

Let's look at `services/lnd/.env.sample`. This will be used by docker-compose
to put the env vars that we define here into the container. Remember that
you'll need to copy these values into a `.env.local` file before running.

What env vars are we using?

```dotenv
ALIAS=my_node_alias
NETWORK=testnet
BACKEND=btcd
RPCHOST=btcd
RPCUSER=devuser
RPCPASS=devpass
DEBUG_LEVEL=debug
NOSEEDBACKUP=true
```

`ALIAS` is the name your node will have in the Lightning Network.

`NETWORK` Testnet, simnet, or mainnet.

`BACKEND` Bitcoin is not one specific program, it is a network, and there are
multiple interoperable implementations of clients for this network. The primary
client is called Bitcoin Core, and that's what most people running a "full
node" on their desktop are running. `btcd` is a separate implemenation, and
it's the one we're using. `lnd` wants to know which implementation it will be
talking to, and we use this variable to tell it.

> 💡 Why are we using `btcd` instead of Bitcoin Core? Because it's the example
used in the `lnd` docs, and because some of the same developers who work on
>`lnd` also work on `btcd`.

`RPCHOST` The host URI where the Bitcoin node (`btcd`) can be found. In our
development environment managed by Docker, our `btcd` service will be mapped
to a local host with the same name. In the same way that you would be able to
talk to a Bitcoin node exposed to the internet at a URI like
`23.54.89.12:18333`, we'll be able to talk to our local instance at
`btcd:18333`.

`RPCUSER` & `RPCPASS` are credentials used by `lnd` to talk to `btcd`.

`DEBUG_LEVEL` controls the level of detail printed to the logs.

`NOSEEDBACKUP` is a **DEVELOPMENT ONLY** flag which tells `lnd` to start with a
wallet created automatically, so that we do not have to go through any creation
steps. There is no way to export the seed phrase or private key from this type
of setup, so is only safe to use in development.

<a name="StartupScript" />

### 1.4 Startup Script (start-lnd.sh)

Just like for `btcd`, there is a command entry in our docker-compose config for
`lnd`:

```yaml
command: ["./start-lnd.sh"]
```

This script does pretty much the same thing as the one in our `btcd` container.
It checks to make sure that some environment variables that we rely on have
been set, and then it starts up `lnd` with the necessary flags.

> 💡 We do not use a `lnd.conf` file for the same reason that we do not use a
`btcd.conf` in that node. All of the flags are specified in the startup script
because some rely on env vars which are accessible there.

**--noseedbackup**

**--alias**

**--bitcoin.active**

**--adminmacaroonpath**

**--tlscertpath**

**--tlskeypath**

**--tlsextraip**

**--tlsextradomain**

**--datadir**

**--logdir**

**--bitcoin.$NETWORK**

**--bitcoin.node**

**--$BACKEND.rpccert**

**--$BACKEND.rpchost**

**--$BACKEND.rpcuser**

**--$BACKEND.rpcpass**

**--rpclisten**

**--debuglevel**

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

Now we're ready to move on to step [03: lnd-gateway](03_lnd-gateway.md).

<a name="ExtraResources" />

## 3. Extra Resources

The [lnd INSTALL doc](https://github.com/lightningnetwork/lnd/blob/master/docs/INSTALL.md)
is a great place to get more detail or dive deeper.

