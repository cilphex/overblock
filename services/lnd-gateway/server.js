import dotenv from 'dotenv';
import LndGrpc from 'lnd-grpc';
import express from 'express';
import WebSocket from 'ws';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.local' });
}

const certPath       = process.env.LND_CERT_PATH;
const macaroonPath   = process.env.LND_MACAROON_PATH;
const base64Cert     = process.env.LND_BASE64_CERT;
const base64Macaroon = process.env.LND_BASE64_MACAROON;
const host           = process.env.LND_HOST;

const cert = (() => {
  if (certPath) return certPath;
  return Buffer.from(base64Cert, 'base64').toString();
})();

const macaroon = (() => {
  if (macaroonPath) return macaroonPath;
  return Buffer.from(base64Macaroon, 'base64').toString('hex');
})();

const grpc = new LndGrpc({ cert, macaroon, host });

grpc.on('locked', () => console.log('grpc locked'));
grpc.on('active', () => console.log('grpc active/unlocked'));
grpc.on('disconnected', () => console.log('grpc disconnected'));

const listenPort = 4040;
const expressApp = express();
const server = expressApp.listen(listenPort);
const wss = new WebSocket.Server({ server });
console.log('listening on port', listenPort);

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
    expressApp.get('/heartbeat', this.handleHeartbeat);

    invoiceStream.on('data', this.handleInvoiceStreamData);
    invoiceStream.on('error', this.handleInvoiceStreamError);

    wss.on('listening', this.handleServerListening);
    wss.on('connection', this.handleServerConnection);
    wss.on('error', this.handleServerError);
  }

  handleHeartbeat = (req, res) => {
    res.send('beating');
  };

  // ==========================================================================
  // GRPC

  handleInvoiceStreamData = (data) => {
    console.log('handleInvoiceStreamData!');

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
    console.log('handleInvoiceStreamError');
  };

  async createInvoice(ws, sats, memo) {
    const params = {
      memo,
    };

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
  };

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

  handleSocketMessage = (ws, data) => {
    console.log('handleSocketMessage', data);

    try {
      data = JSON.parse(data);
    }
    catch(e) {
      return ws.emit('error', e);
    }

    switch(data.type) {
      case 'create_invoice':
        this.createInvoice(ws, data.sats, data.memo);
        break;
      default:
        this.sendError(new Error(`Unknown type ${data.type}`));
    }
  };

  handleSocketError = (ws, err) => {
    console.log('handleSocketError', err);
    this.sendError(err);
  };

  handleSocketClose = (ws) => {
    console.log('handleSocketClose');
  };

  sendError = (err) => {
    const message = {
      type: 'error',
      message: e.message,
    };
    ws.send(JSON.stringify(message));
  }
}

new App();
