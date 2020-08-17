# 1. btcd

Let's get started with `btcd`, the first microservice.

1. [Overview](#Overview)
    1. [Dockerfile](#Dockerfile)
    2. [Docker Compose](#DockerCompose)
    3. [Environment](#Environment)
    4. [Startup Script](#StartupScript)
    5. [Command Line](#CommandLine)
2. [Running in Development](#RunningInDevelopment)

<a name="Overview" />

## 1. Overview

All we're trying to do is get to a state where we can tell some `btcd` process
to start or stop, so that when it is running we can use it to do Bitcoin
things. [btcd](https://github.com/btcsuite/btcd) is an existing project so
we're not actually writing any crypto logic, we're just setting up a process
for downloading and running that program with our specific parameters.

<a name="Dockerfile" />

### 1.1 Dockerfile

Take a look at `services/btcd/Dockerfile`. This file is a set of
instructions for constructing an image for our `btcd` service.

> 💡 An image is like a snapshot of an operating system with installed programs.
An image can be used to create "containers" (active, running instances of the
image) later on.

You'll see that the Dockerfile basically just sets up a `Go` environment and
then downloads and installs `btcd` from github.

It also contains these lines:

```dockerfile
COPY "start-btcd.sh" .
```
```dockerfile
&&  chmod +x start-btcd.sh \
```

`start-btcd.sh` is a script in `services/btcd/` that is copied into the docker
image. The script is what we use to actually call and run the `btcd` program
inside the `btcd` containers.

We'll use this script rather than running `btcd` directly because `btcd` takes
a lot of parameters, and it's easier to list those parameters and include some
logic for them from within a script than at the command line.

<a name="DockerCompose" />

### 1.2 docker-compose

docker-compose is a tool for managing Docker images and containers. It uses a
`docker-compose.yaml` file to orchestrate them. The `docker-compose.yaml` file
is a list of "services" (images) and how to build them and run them as
containers. Once we write it, we can use the command line to build images and
start & stop containers.

Take a look at the root-level `docker-compose.yaml`. You can see that
the `btcd` service is the first one listed. Here's the snippet:

```yaml
btcd:
  image: btcd
  container_name: btcd
  build: ./services/btcd/
  env_file: ./services/btcd/.env.local
  volumes:
    - btcd_data:/data
    - shared_rpc_data:/rpc
  command: ["./start-btcd.sh"]
```

Let's break it down.

```yaml
image: btcd
build: ./services/btcd/
```

This means: When I run `docker-compose build btcd`, build the files from
`./services/btcd` into an image named `btcd`.

(In the line `docker-compose build btcd`, the `btcd` refers to the service
entry in docker-compose.yaml. The `btcd:` line, not the `image: btcd` line.)

```yaml
container_name: btcd
```

This means: When I run `docker-compose up btcd`, start a container with the
name `btcd` from this image.

```yaml
env_file: ./services/btcd/.env.local
```

This means: When I run `docker-compose up btcd`, set the environment variables
inside the container to the ones listed in this file.

```yaml
volumes:
  - btcd_data:/data
  - shared_rpc_data:/rpc
```

This means: Map the `/data` path inside `btcd` containers to a shared,
persistent volume outside the container named `btcd_data`. And the same
for `/rpc` and `shared_rpc_data`.

```yaml
command: ["./start-btcd.sh"]
```

This means: When I run `docker-compose up btcd`, run this command as soon as
the container is ready. If a command isn't specified, the container will stop
after starting because it won't have anything to do.

<a name="Environment" />

### 1.3 Environment

Remember this line from `docker-compose.yaml`?

```yaml
env_file: ./services/btcd/.env.local
```

It specifies a location for the environment variables to be injected into the
`btcd` container. Since it's a local file, it doesn't come with the code and
you'll need to create it.

There is a sample env file at `services/btcd/.env.sample` to show you what
variables are necessary and what types of values are acceptable. If you copy
the "testnet" section to your own `.env.local`, that will work.

What env vars are we using in `btcd`?

```dotenv
RPCUSER=devuser
RPCPASS=devpass
NETWORK=testnet
DEBUG_LEVEL=info
```

`RPCUSER` and `RPCPASS` can be anything. We'll need to specify these values
for `lnd` when we get to it later, since it'll use them to talk to our `btcd`
node over RPC.

`NETWORK` just specifies that we're working with the Bitcoin testnet for now,
not mainnet.

`DEBUG_LEVEL` controls what level of detail you see from the `btcd` executable
in the `btcd` container.

<a name="StartupScript" />

### 1.4 Startup Script (start-btcd.sh)

In our entry for `btcd` in `docker-compose.yaml`, there is one more important
line:

```yaml
command: ["./start-btcd.sh"]
```

This says: "When the container starts and is ready, run this command." The
command is just an executable script called `start-btcd.sh` that we copied from
the `services/btcd/` directory into the image when it was built from the
Dockerfile.

Let's look at a couple parts of the file. First:

```shell script
assert "$RPCUSER" "RPCUSER must be specified"
assert "$RPCPASS" "RPCPASS must be specified"
assert "$NETWORK" "NETWORK must be specified"
assert "$DEBUG_LEVEL" "DEBUG_LEVEL must be specified"
```

When we run the script, the first thing we do is check that these environment
variables are present. If they're not, we quit and the container stops. We do
this to reduce the risk of accidentally starting without these variables and
being in an unexpected state.

Further down, we see this:

```shell script
PARAMS=$(echo "$PARAMS" \
  "--rpcuser=$RPCUSER" \
  "--rpcpass=$RPCPASS" \
  "--datadir=/data" \
  "--logdir=/data" \
  "--rpccert=/rpc/rpc.cert" \
  "--rpckey=/rpc/rpc.key" \
  "--rpclisten=0.0.0.0" \
  "--txindex" \
  "--debuglevel=$DEBUG_LEVEL"
)
```

This is the part where we establish the flags that we're going to start the
`btcd` process with.

(More details on the following flags and others can be found in the
[sample-btcd.conf](https://github.com/btcsuite/btcd/blob/master/sample-btcd.conf)
from the main `btcd` project.)

**--rpcuser and --rpcpass**

These are set from our env vars, which come from the `.env.local` we specified
in our `docker-compose.yaml` entry for `btcd`.

**--datadir and --logdir**

These are set to `/data`. This means that inside the
container, the `btcd` process will save blockchain and log data in the `/data`
directory. We mapped that directory to a volume in the `docker-compose.yaml`,
so even after the container stops or is removed, the data will still be there.
This makes the data resilient to restarts and rebuilds.

**--rpccert and --rpckey**

These flags specify the location of the credentials used for RPC
calls to the `btcd` process. To make an RPC call to `btcd` inside the
container, we'll need to use these credentials. `btcd` generates them
automatically on startup if they do not already exist, and places them in the
specified directory.

Typically you might have to copy these files and manually paste them into the
command line or env vars of another process to utilize them. But since we place
them in the container's `/rpc` directory, and since we map that directory to
the `shared_rpc_data` volume in the `docker-compose.yaml`, we'll just be able
to point to the files in that shared volume later from whichever process we're
trying to call to `btcd` with.

**--rpclisten**

This flag sets up `btcd` to listen on the default port on the container for RPC
calls.

**--txindex**

This flag is necessary for `btcd` to build an index that `lnd` relies on.

> 🤔 _Question: It looks looks like you can create a `btcd.conf` file to specify
runtime parameters. Why not use one?_
>
> Answer: Some of the parameters rely on env vars, which can be utilized through
a script, but not through a config file. It's nice to keep all of the flags in
the same location so they're easier to see at a glance. So they're all put in
the startup script rather than having some flags in the startup script and some
in an `btcd.conf` file.

The last thing we call in `start-btcd.sh` is the `btcd` executable itself,
which starts our node in the container:

```shell script
echo "Starting btcd"
exec btcd $PARAMS
```

<a name="CommandLine" />

### 1.5 Command Line (btcd-cli)

When our `btcd` container is running, we might want to be able to query the
node through the command line to see how it's doing. `btcd` comes packaged with
a program called `btcctl` which helps us with that.

For example, if your `btcd` was running locally, you could run
`btcctl getblockcount` to see how far the node has synced to the blockchain.

In our case, `btcd` and `btcctl` are running in a container. We could jump into
the container every time we want to run a `btcctl` command, but that's a lot of
effort.

Instead, we can put the task of calling the container's `btcctl` program inside
of a script. That script is `bin/btcd-cli`. Since it's an executable
script, we put it in the `bin` directory.

The script essentially does this:

```shell script
docker-compose exec btcd btcctl \
  $(echo "--$NETWORK") \
  --rpccert=/rpc/rpc.cert \
  --rpcuser=$RPCUSER \
  --rpcpass=$RPCPASS \
  "$@"
```

This says: "Execute the `btcctl` command inside the `btcd` container with the
following flags". 

Since `btcctl` talks to `btcd` over RPC, it needs the RPC credentials
specified, and the script takes care of that for us. Any additional flags you
specify are then added.

Add the project's `bin` directory to your path so that you can run `btcd-cli`
and other executables easily from your terminal: 

```shell script
# overblock development executables
export PATH="$HOME/Code/overblock/bin:$PATH"
```

When things are up and running, you'll be able to run `btcd-cli getblockcount`
locally, and it will print the value that `btcctl` returns from inside the
container.

<a name="RunningInDevelopment" />

## 2. Running in Development

Run this to build the `btcd` container:

```shell script
docker-compose build btcd
```

Run this to bring the container up:

```shell script
docker-compose up btcd
```

The container should start and logs from the `btcd` process should start
printing. Take a look at them to see what it's doing.

You can use `btcd-cli` to query the bitcoin node and see its info:

```shell script
# Node information
btcd-cli getinfo
```

```shell script
# Number of blocks synced
btcd-cli getblockcount
```

```shell script
# Discover other commands
btcd-cli -h
```

It will take some time for the node to sync, and for now we'll just let it do
that while we move on to the next step, [02: lnd](02_lnd.md).