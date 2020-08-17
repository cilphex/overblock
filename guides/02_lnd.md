# 2. lnd

The next microservice to get up and running is the Lightning node, `lnd`. The
setup is very similar to `btcd`.

1. [Overview](#Overview)
    1. [Dockerfile](#Dockerfile)
    2. [docker-compose](#DockerCompose)
    3. [Environment](#Environment)
    4. [Startup Script](#StartupScript)
    5. [Command Line](#CommandLine)
2. [Running in Development](#RunningInDevelopment)
3. [Extra Resources](#ExtraResources)

<a name="Overview" />

## 1. Overview

All we're trying to do is get to a state where we can tell some `lnd` process
to start or stop, so that when it is running we can use it to do Lightning
Network things. [lnd](https://github.com/lightningnetwork/lnd) is an existing
project so we're not actually writing any crypto logic, we're just setting up a
process for downloading and running that program with our specific parameters.

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
than running `lnd` directly because `lnd` takes a lot of parameters, and it's
easier to list those parameters and include some logic for them from within a
script than at the command line.

<a name="DockerCompose" />

### 1.2 docker-compose

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
the container should be mapped to port `9735` in the host environment (your
computer). Same for port `10009`.

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

(More details on the following flags and others can be found in the
[sample-lnd.conf](https://github.com/lightningnetwork/lnd/blob/master/sample-lnd.conf)
from the main `lnd` project.)

```shell script
# Comments removed
PARAMS=""

if [ "$NOSEEDBACKUP" = "true" ]; then
  PARAMS="--noseedbackup"
fi

PARAMS=$(echo "$PARAMS" \
  "--alias=$ALIAS" \
  --bitcoin.active \
  --adminmacaroonpath=/shared/admin.macaroon \
  --tlscertpath=/shared/tls.cert \
  --tlskeypath=/lnd/tls.key \
  --tlsextraip=0.0.0.0 \
  --tlsextradomain=lnd \
  --datadir=/lnd/data \
  --logdir=/lnd/logs \
  "--bitcoin.$NETWORK" \
  "--bitcoin.node=$BACKEND" \
  "--$BACKEND.rpccert=/rpc/rpc.cert" \
  "--$BACKEND.rpchost=$RPCHOST" \
  "--$BACKEND.rpcuser=$RPCUSER" \
  "--$BACKEND.rpcpass=$RPCPASS" \
  "--rpclisten=0.0.0.0:10009" \
  "--debuglevel=$DEBUG_LEVEL"
)
```

**--noseedbackup**

This means that when we start `lnd`, it will initialize a new wallet
automatically if one does not already exist. The private keys & seed phrase
will be inaccessible. It is a *development-only* flag, never to be used in
production.

**--alias**

The nickname that your node will be given inside the Lightning network.

**--bitcoin.active**

If the "bitcoin chain should be active". To be honest, I don't know why the
bitcoin chain wouldn't be active, but this seems to be necessary. Please open
a pull request to update this text if you know more.

**--adminmacaroonpath**

Specifies the admin macaroon path, a credential file for interfacing with
`lnd`. We specify the location of this file so that it is isolated in its own
directory that we map to a volume. The volume allows the file to persist
through container rebuilds, and also to be accessible by our next service,
`lnd-gateway`.

Note that the location we specify is a directory called `/shared`, which is
separate from the `/lnd` directory/volume that we specify for `--datadir`
and `--logdir` below. Why do we do that?

By default, the admin macaroon path would be stored in the data directory. We
want to use a volume to share these credentials between services but we don't
need all of `lnd`'s data, such as channel states, to be accessible by other
processes. So we put the data that we want to persist into its own
directory/volume at `/data`, and the shared credentials into a separate
directory/volume to isolate them.

**--tlscertpath**

Path to TLS certificate for `lnd`'s RPC and REST services. We put this in the
`/shared` directory for the same reason as `--adminmacaroonpath`.

**--tlskeypath**

Path to TLS private key for lnd's RPC and REST services. This is the private
part of the 2-key set. We want it to persist through rebuilds and be accessible
by `lnd` but not by any other process, so we put it in `/lnd`

**--tlsextraip**

`lnd` generates a TLS certificate on startup. To be honest, I'm not super 
familiar with how certificates function. But for the certificate to work for
us, it needs to have a concept of the domains that it should cover, and since
we want our `lnd` to be accessible through `0.0.0.0`, we need to specify that
IP here for the certificate to work when we try to use the TLS certificat that
is generated to access `lnd` through that IP.

**--tlsextradomain**

We also want to be able to access `lnd` through the docker network host that
will be created and which will be named after our servce. Our service will
be named `lnd` and will be accessible locally through that host name. We want
that host name to be covered by the TLS certificate, so we must specify it
here.

**--datadir**

Location of `lnd`'s data, like transactions, channel states, and wallet info.

**--logdir**

Where logs will be written to.

**--bitcoin.$NETWORK**

This flag is confusing because it would be easier to read if it looked like
this: `--bitcoin.network=testnet`. Instead, there are separate flags for each
network, so to activate testnet you simply pass `--bitcoin.testnet`, which
specifies that the network will be `testnet`.

**--bitcoin.node**

Specify what type of node backend `lnd` will be talking to. In our case, `btcd`.

**--$BACKEND.rpccert**

The location of the certificate for accessing `btcd`, our first service.
It will be located in the `/rpc` directory because in our `btcd` project in the
`start-btcd.sh` script, we specified `/rpc` as the location for the
certificate. Then we mapped `/rpc` to the same shared volume for both the
`btcd` container and the `lnd` container, so they can both read from and write
to there.

> TODO: Should the rpc.key in the btcd project NOT be in /rpc since it's a
shared directory?

**--$BACKEND.rpchost**

Note that with our environment variable `BACKEND=btcd` in the `.env` file, this
line is actually `--btcd.rpchost`. This is telling lightning that it can find
our bitcoin node at a host named `btcd`.

**--$BACKEND.rpcuser**

Username for RPC connections to `btcd`.

**--$BACKEND.rpcpass**

Password for RPC connections to `btcd`.

**--rpclisten**

The interface to listen to gRPC requests on. Note that this should match the
value for `--tlsextraip` above. (It is possible to listen on multiple
interfaces but we're not doing that.)

**--debuglevel**

The level of detail to be printed to the logs.

<a name="CommandLine" />

### 1.5 Command Line

Similar to how the `btcd` node comes packaged with a command-line program
called `btcctl`, the `lnd` node comes packaged with a command-line program
called `lncli`.

Just like how we provide a script called `btcd-cli` to wrap `btcctl` so that
we can run commands for the node inside the container from outside of the
container, we provide a script called `lnd-cli` to wrap `lncli` for the same
purpose.

The script is located at `bin/lnd-cli`.

```shell script
docker-compose exec lnd lncli \
  --macaroonpath /shared/admin.macaroon \
  --tlscertpath /shared/tls.cert \
  "$@"
```

Note how `lncli` requires some credentials to query `lnd` inside the container:
`--macaroonpath` and `--tlscertpath`. Since we provide a custom path for the
location of these credential files in `services/lnd/start-lnd.sh`, we need to
specify those custom paths here.

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

