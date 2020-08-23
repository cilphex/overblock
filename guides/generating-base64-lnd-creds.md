# Generating base64 credentials for lnd

Here's how we can generate base64-encoded credentials for use with `lnd`.

First `lnd` needs to be running:

```shell script
docker-compose up lnd
```

Now that it's running, let's go into the container. We can open a command-line
interface in the container by running `bash` via `docker-compose exec`:

```shell script
docker-compose exec lnd bash
```

This says: `exececute the bash command inside the lnd container`.

Once you run it, you should be at a command prompt inside the `lnd` container.

Now that we're in, we need to navigate to the `tls.cert` and `admin.macaroon`
files. Remember that in our startup script for initializing the `lnd` process,
`start-lnd.sh`, we pass a couple of flags that specify the location of these
files within the container:

```shell script
--adminmacaroonpath=/shared/admin.macaroon \
--tlscertpath=/shared/tls.cert \
```

We can see that we're both in the `/shared` directory. Let's go to that
directory and see what's in it:

```shell script
bash-5.0# cd /shared
bash-5.0# ls
admin.macaroon  tls.cert
```

We see `admin.macaroon` and `tls.cert`. Now let's convert them to base64:

```shell script
bash-5.0# base64 tls.cert | tr -d '\n'
LS0tLS......0tLS0K

bash-5.0# base64 admin.macaroon | tr -d '\n'
AgEDbG......efqA==
```

That's it. Thanks to
[this repo readme](https://github.com/alexbosworth/lightning) for the base64
commands.