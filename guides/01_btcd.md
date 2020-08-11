# btcd

Let's get started with `btcd`, the first microservice.

### Dockerfile

Take a look at `services/btcd/Dockerfile`. This file is a set of
instructions for constructing an image for our `btcd` service.

An image is like a snapshot of an operating system with installed programs.
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

### Docker Compose

Docker-compose is a tool for managing Docker images and containers. It uses a
Dockerfile to orchestrate them. The Dockerfile is a list of services and how to
build and run them. Once we write it, we can use the command line to build
images and start & stop containers.

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

### Build

```
docker-compose build btcd
```

### Run

```
docker-compose up btcd
```

Now you can watch the blocks sync. Explain `bin/btcd-cli` here...















- (switch order of dockerfile and docker-compose)
- (describe each part of docker-compose like command, volumes, and env_file)