# bin

These executables help you run commands in your docker containers without
having to run `docker-compose exec <command>`.

| Executable | Purpose |
| :--- | :--- |
| btcd-cli | Run `btcctl` in your `btcd` container. `btcctl` is the command-line interface that comes with the bitcoin node, [btcd](https://github.com/btcsuite/btcd). |
| lnd-cli | Run `lncli` in your `lnd` container. `lncli` is the command-line interface that comes with the lightning node, [lnd](https://github.com/lightningnetwork/lnd). |