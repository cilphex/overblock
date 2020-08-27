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
- let's start by creating the persistent disk that will hold the blockchain
  data
- we will NOT create a disk for the shared rpc creds, which would be equivalent
  to the shared_rpc_data volume
- this is because GCE doesn't support volumes, or tiny, persistent, shared disks.
  the only disk solutions are large (like 1tb large) or not shareable among VMs
- go to compute engine > disks
- click "create disk"
- show screenshot and field options
- 500 gb to start, can be resized later
- might be good to create snapshot schedule but exercise for the reader
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
- enter a unique username and pass, save so we can enter in LND env vars too
- attach disk at bottom
- select volume mounts for blockchain data
- create instance
- will create, select 3 dots at end of row and then view logs
- should start seeing some blockchain sync stuff in the logs
- another way to check that things are running, tail logs in the container itself
- go to vm instances page, click "ssh" on our entry
- this will open a console to the VM running our container
- once inside, we can do `docker ps` to show the running containers
- grab the container ID
- then do `docker exec -it <container-id> bash`, since our container has bash installed
- this will pop us into the container
- do `cd /data`
- do `ls`, and you should see a `testnet` dir
- do `cd testnet`
- do `ls`, and you should see `btcd.log`
- do `tail -f btcd.log` and you should see the blockchain syncing. nice!

---

- time for lnd
- let's create the disk first. 200 gb or whatever makes sense
- go back to container registry
- go into lnd builds dir
- on row tagged `latest` (should be the top row), select 3 dots, then "deploy to GCE"
- fill out page as before
- attach disk at bottom
- then attach it as volume with read/write and /lnd mount path
- for command, enter ./start-lnd.sh
- add env vars
- LEAVE OUT NOSEEDBACKUP env var
- for RPCHOST, get the internal IP for the btcd VM from the instances page
- enter copied values from btcd for RCUSER and RPCPASS
- click create
- go to vm instances page, click ssh on the lnd instance
- will pop you into vm. open bash in the docker container as you did with btcd
- type `ps`, you will see tail running: `tail -f /dev/null`
- first lets copy the rpc credential files from the btcd container to the lnd container,
  since we don't have a shared volume for this in this GCE setup
- open bash in the btcd container and navigate to `/rpc`
- type `cat rpc.cert` to show the cert file contents
- copy the block
- open bash in the lnd container and navigate to `/rpc`. you may have to create this dir first
- we can use `echo` to write a copy of the file
- without hitting return, type `echo "`, then paste the cert contents, then type `" > rpc.cert`
- your console should look like:

```shell script
bash-5.0# echo "-----BEGIN CERTIFICATE-----
> ASDF...
> ASDF...
> ASDF...
> -----END CERTIFICATE-----" > rpc.cert
```

- now hit enter, and the pasted contents should be written to rpc.cert
- do the same thing with rpc.key
- in your lnd container, navigate to `/`



put ./start-lnd.sh as the startup command and
restart after lnd:latest image is built