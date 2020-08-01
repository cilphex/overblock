# basic-site-frontend

Basic website frontend using React and Webpack.

### Todo

- Switch from koa back to express, since the selling point for koa is unclear 
- Get testnet btcd and lnd running locally with RTL
- Get prod btcd and lnd running with RTL 

### Dev

```sh
yarn install
yarn start:dev
```

Note that start:dev uses `Koa` instead of the simpler `http-server` because
`http-server` cannot expose port `0.0.0.0`, which is required for Google Cloud
Run.

### Prod

```sh
yarn install
yarn start-prod
```

### Prod docker

docker-compose

```sh
# Rebuild
docker-compose build (or)
docker-compose build web

# Start up
docker-compose up

# Tear down
docker-compose down
```

Plain docker

```sh
# Build the image
docker build -t basic-site-frontend .

# Start a container
docker run -p 4000:8080 basic-site-frontend

# List running containers
docker ps (or)
docker container ls

# Stop container
docker container stop <container-id>
```

### Updating node version

```sh
nvm install <version>
brew install yarn
# update Dockerfile
```

### Deployment (gcloud)

"Using Cloud Build, you can deploy container images from Container Registry to Cloud Run"

Deploying requires the IAM permissions [described here](https://cloud.google.com/cloud-build/docs/deploying-builds/deploy-cloud-run).

Command line:

```sh
gcloud projects list
gcloud config set project <project-id>
gcloud config get-value project

# Build and deploy
# (Individual steps in cloudbuild.yml) 
gcloud builds submit (relies on cloudbuild.yml)
```

Automatic:

- Cloud build has a hook to automatically build on commit to master. The
  cloudbuild.yaml file has steps including build, pushing to registry, and
  deploying.
  
### Things learned

- Google Cloud Build, Run, Registry
- Basic Koa server
- Docker compose file
- Basic testnet lightning payment
- Bash PS1 no-length characters

### Things I still don't understand

- A Dockerfile is for building an image _and_ running a container?? It seems
  overloaded with "install" steps but also typically ending with a command
  (CMD). This is confusing.
- Are some build steps being duplicated when building and running?
- When running `yarn install --production`, why must my `package.json` have
  dependencies that are only necessary for building (like "moment") under
  `dependencies` rather than `devDepencencies`? Or does it not? Could do
  `yarn install` without `--production` but then that defeats the purpose of
  their separation in `package.json` 