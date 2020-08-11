# btcd

Let's get started with `btcd`, the first microservice.

### Code overview

- (switch order of dockerfile and docker-compose)
- (describe each part of docker-compose like command, volumes, and env_file)

First, take a look at the root-level `docker-compose.yaml`. You can see that
the `btcd` service is the first one listed. We'll use docker-compose to bring
up this service.

Here's the part from `docker-compose.yaml`:

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

Next, take a look at `services/btcd/Dockerfile`. This file is a set of
instructions for constructing an image for our `btcd` containers.

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
inside the `btcd` containers. (See the "command" line of the
`docker-compose.yaml` snippet above!)

We use this script rather than running `btcd` directly because `btcd` takes a
lot of parameters, and it's easier to list those parameters and include some
logic for them from within a script than at the command line.

### Build

```
docker-compose build btcd
```

### Run

```
docker-compose up btcd
```

Now you can watch the blocks sync. Explain `bin/btcd-cli` here...