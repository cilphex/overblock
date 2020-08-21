# Overblock

![Preview](https://imgur.com/DLpQVsp.png)

Overblock is a development example website for receiving bitcoin lightning
payments, inspired by Acinq's [starblocks](https://starblocks.acinq.co/).

See the [guides](guides/) for a walkthrough. They're currently incomplete.

### Microservices

We are not particularly opinionated about microservices, but since some of the dependencies are executables
(such as `btcd` and `lnd`), it's nice to separate the concerns and just wrap them in containers. It would also
be easier to scale.

The microservices are listed in the `./docker-compose.yaml` file.

| Microservice | Purpose |
| :--- | :--- |
| `btc` | The [bitcoin node](https://github.com/btcsuite/btcd). |
| `lnd` | The [lightning node](https://github.com/lightningnetwork/lnd). |
| `lnd-gateway` | Websocket API server, makes gRPC calls to `lnd`. |
| `web` | Basic web server serving up flat files, written in React and compiled with Webpack. |

**Optional microservices**

| Microservice | Purpose |
| :--- | :--- |
| `rtl` | [Ride the Lightning](https://github.com/Ride-The-Lightning/RTL), a web interface for managing the lightning node. |
