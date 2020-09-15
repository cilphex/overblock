import dotenv from 'dotenv';
import LndGrpc from 'lnd-grpc';
import express from 'express';
import WebSocket from 'ws';

const development = process.env.NODE_ENV === 'development';
const production = process.env.NODE_ENV === 'production';

if (!development && !production) {
  console.log('ERROR: process.env.NODE_ENV is not defined');
  process.exit(1);
}
else {
  console.log('starting', development && '(dev)' || production && '(prod)' || `(${process.env.NODE_ENV})`)
}

// In production we don't load the env file through javascript. env vars are
// loaded through docker-compose or our cloud environment. Only in development
// do we load directly from an env file in the project code.
if (development) {
  dotenv.config({ path: '.env.local' });
}

// Is used only in local docker mode, where we can easily share cred files
// with volumes
const certPath       = process.env.LND_CERT_PATH;
const macaroonPath   = process.env.LND_MACAROON_PATH;

// Used in other environments, like local process and production containers
const base64Cert     = process.env.LND_BASE64_CERT;
const base64Macaroon = process.env.LND_BASE64_MACAROON;

// Should be defined in any environment
const host           = process.env.LND_HOST;
const port           = process.env.PORT;

if ((certPath || macaroonPath) && (base64Cert || base64Macaroon)) {
  console.log('ERROR: production and development variables should not be mixed');
  process.exit(1);
}

const cert = (() => {
  if (certPath) {
    return certPath;
  }
  if (base64Cert) {
    return Buffer.from(base64Cert, 'base64').toString();
  }
  console.log('ERROR: cert undefined');
  process.exit(1);
})();

const macaroon = (() => {
  if (macaroonPath) {
    return macaroonPath;
  }
  if (base64Macaroon) {
    return Buffer.from(base64Macaroon, 'base64').toString('hex');
  }
  console.log('ERROR: macaroon undefined');
  process.exit(1);
})();

const grpc = new LndGrpc({ cert, macaroon, host });

grpc.on('locked', () => console.log('grpc locked'));
grpc.on('active', () => console.log('grpc active/unlocked'));
grpc.on('disconnected', () => console.log('grpc disconnected'));

const expressApp = express();
const server = expressApp.listen(port);
const wss = new WebSocket.Server({ server });

console.log('listening on port', port);
console.log('If this process is running in a container, it may be mapped to a different host port.');

let Lightning;

// The callbacks look nicer when bundled into a little class like this
class App {
  constructor() {
    this.setup();
  }

  async setup() {
    try {
      await grpc.connect();
    }
    catch(e) {
      console.log('GRPC connect error: ', e.message);
      process.exit(1);
    }

    Lightning = grpc.services.Lightning;
    const invoiceStream = Lightning.subscribeInvoices();

    // Heartbeat REST route
    expressApp.get('/', this.handleRoot);
    expressApp.get('/heartbeat', this.handleHeartbeat);

    invoiceStream.on('data', this.handleInvoiceStreamData);
    invoiceStream.on('error', this.handleInvoiceStreamError);

    wss.on('listening', this.handleServerListening);
    wss.on('connection', this.handleServerConnection);
    wss.on('error', this.handleServerError);
  }

  handleRoot = async (req, res) => {
    const Lightning = grpc.services.Lightning;
    const info = await Lightning.getInfo();
    res.send(`<pre>${JSON.stringify(info, null, 2)}</pre>`);
  };

  handleHeartbeat = (req, res) => {
    res.send('beating');
  };

  // ==========================================================================
  // GRPC

  handleInvoiceStreamData = (data) => {
    console.log('handleInvoiceStreamData');

    const ws = this.getSocketForPaymentRequest(data.payment_request);

    if (!ws) {
      console.log('No socket for this payment request');
      return;
    }

    if (ws.readyState !== WebSocket.OPEN) {
      console.log('Socket not ready for this payment request');
      return;
    }

    data.message_type = 'invoice';

    ws.send(JSON.stringify(data));
  };

  handleInvoiceStreamError = (err) => {
    console.log('handleInvoiceStreamError', err);
  };

  createInvoice = async (ws, sats, memo) => {
    const params = {
      memo,
    };

    if (!sats) {
      return this.sendError(ws, new Error('sats is missing'));
    }

    if (sats >= 1) {
      params.value = sats;
    }
    else {
      params.value_msat = sats * 1000;
    }

    const invoice = await Lightning.addInvoice(params);

    // Attach the payment request to the websocket instance so that when we get
    // future updates on this invoice, we can scan wss.clients (the attached
    // client sockets) for the one that matches, so we can send updates to only
    // that one.
    ws.payment_request = invoice.payment_request;
  }

  // ==========================================================================
  // Server

  handleServerListening = () => {
    console.log('handleServerListening');
  };

  handleServerConnection = (ws) => {
    console.log('handleServerConnection');
    ws.on('open', this.handleSocketOpen.bind(this, ws));
    ws.on('message', this.handleSocketMessage.bind(this, ws));
    ws.on('error', this.handleSocketError.bind(this, ws));
    ws.on('close', this.handleSocketClose.bind(this, ws));
  };

  handleServerError = (err) => {
    console.log('handleServerError', err);
  };

  getSocketForPaymentRequest = (paymentRequest) => {
    return Array.from(wss.clients).find(
      ws => ws.payment_request == paymentRequest
    );
  };

  // ==========================================================================
  // Sockets

  handleSocketOpen = (ws) => {
    console.log('handleSocketOpen');
  };

  handleSocketMessage = async (ws, data) => {
    console.log('handleSocketMessage', data);

    try {
      data = JSON.parse(data);
    }
    catch(err) {
      return this.sendError(ws, err);
    }

    try {
      switch (data.type) {
        case 'create_invoice':
          await this.createInvoice(ws, data.sats, data.memo);
          break;
        default:
          this.sendError(ws, new Error(`Unknown type ${data.type}`));
      }
    }
    catch(err) {
      return this.sendError(ws, err);
    }
  };

  handleSocketError = (ws, err) => {
    console.log('handleSocketError', err);
    this.sendError(ws, err);
  };

  handleSocketClose = (ws) => {
    console.log('handleSocketClose');
  };

  sendError = (ws, err) => {
    const message = {
      message_type: 'error',
      message: err.message,
    };
    ws.send(JSON.stringify(message));
  };
}

new App();
