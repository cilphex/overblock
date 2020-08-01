# lnd

Image for lnd container

#### Regenerate Certs

Go into container:
- `docker exec -it lnd /bin/sh`
- `rm /shared/tls.cert`
- `rm /lnd/tls.key`

Out of container:
- stop container
- if you're trying to edit the cert by for example adding an extraip, then right here you should remove the stopped container and rebuild it
  - `docker container prune`
  - `docker-compose build lnd` 
- start container

Go into container:
- `docker exec -it lnd /bin/sh`
- `base64 /shared/tls.cert | tr -d '\n'`

#### Notes

`lnd` won't just start right back up again after the container is removed and
rebuilt. I think this is because the tls.cert is stored in a persistent volume,
but the matching key is not and is destroyed on container removal. The solution
to this is to either destroy the persistent volume ("shared_lightning_data"
currently) as well, or persist the key. The best way to do this might be to
have a persistent volume for the lnd data dir (".lnd"). This should make
restarts and recoveries much easier generally.

#### Todo

- Specify the data dir for lnd and map it to a volume that persists through
  instances. According to the
  [lnd safety doc](https://github.com/lightningnetwork/lnd/blob/master/docs/safety.md#migrating-a-node-to-a-new-device),
  moving the whole data directory to the new device is the preferred way to
  migrate a node. Though THE LAST INSTANCE MUST BE SHUT DOWN FIRST.