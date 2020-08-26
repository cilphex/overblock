# Google Cloud Deployment

- Create a Google Cloud account
- At some point you will be prompted for payment details and to enable APIs
  that cost money. It's relatively cheap, but not free.
- user will want to first fork the repo on github
- create a new project in cloud console called "overblock"
- explain what cloud build is
- go to the cloud build section in google cloud console
- go to "create trigger", provide proper values based on user's forked repo,
  save it
- back in project, view the cloudbuild.yaml and explain what it is and what
  it's doing
- edit cloudbuild.yaml to use user's project ID from google cloud
- commit this change to github
- in cloud build, run the trigger
- user should see built images in container registry, one for each
  of our services
- each image has its own build history, check it out by clicking them

---

- now proceed with each service as in development
- first is btcd
- let's start by creating the persistent disks that will hold the blockchain
  data and the shared rpc creds - same as our "volumes" from docker-compose
- go to compute engine > disks
- click "create disk"
- show screenshot and field options
- click create
- disk created, can see it in disks list
- go to google cloud "compute engine" section and enable it
- go to container registry, images section
- click into btcd
- on the row tagged "latest", select 3 dots at the end on right side
- select "deploy to GCE"
- this is just a shortcut that we could get to through the GCE menu anyway,
  but this way prefills the "container image" field in the instance options
- enter name and processor type
- see that container image is prefilled
- click advanced options
- enter ./start-btcd.sh for "command"
- enter env vars
- select volume mounts (both: for blockchain data & shared creds)
