import { observable } from 'mobx';
import QRCode from 'qrcode';

const socketHost = 'ws://localhost:4040';

class LndStore {
  ws = null;
  expiry_interval = null;

  @observable waitingForInvoice = false;
  @observable invoice = null;
  @observable error = null;

  constructor() {
    this.setupSocket();
  }

  setupSocket() {
    this.ws = new WebSocket(socketHost);
    this.ws.onopen = this.handleSocketOpen;
    this.ws.onmessage = this.handleSocketMessage;
    this.ws.onerror = this.handleSocketError;
    this.ws.onclose = this.handleSocketClose;
  }

  handleSocketOpen = () => {
    console.log('open');
  };

  handleSocketMessage = (message) => {
    const data = JSON.parse(message.data);

    switch(data.message_type) {
      case 'invoice':
        this.handleInvoiceMessage(data);
        break;
      default:
        console.log(`got unknown messageType: ${data.message_type}`);
    }
  };

  handleSocketError = () => {
    console.log('error');
  };

  handleSocketClose = () => {
    console.log('close');
  };

  // ==========================================================================
  // Invoices

  createInvoice = (sats, memo) => {
    console.log('create invoice');
    const message = {
      type: 'create_invoice',
      sats,
      memo,
    };
    this.ws.send(JSON.stringify(message));
    this.waitingForInvoice = true;
  };

  startExpiryCountdown = () => {
    console.log('start expiry countdown');
    const { expiry } = this.invoice;
    if (expiry == undefined || expiry <= 0) {
      return;
    }
    clearInterval(this.expiry_interval);
    this.expiry_interval = setInterval(this.updateExpiryCountdown, 1000);
  };

  updateExpiryCountdown = () => {
    this.invoice.expiry -= 1;
    if (this.invoice.expiry <= 0) {
      clearInterval(this.expiry_interval);
    }
  };

  clearInvoice = () => {
    clearInterval(this.expiry_interval);
    this.invoice = null;
  };

  async handleInvoiceMessage(data) {
    console.log('handleInvoiceMessage');
    this.waitingForInvoice = false;

    // We're only interested in generic messages that are updates to an invoice
    // that we're already looking at. That should be the case at this point
    // anyway, but have this check just in case.
    if (!this.invoice) {
      data.qrcode_url = await QRCode.toDataURL(data.payment_request);
      this.invoice = data;
    }

    // If an invoice already exists...
    else {
      // Check to ensure the payment request matches. We shouldn't receive
      // messages that don't match anyway, but check just in case.
      if (data.payment_request != this.invoice.payment_request) {
        return;
      }
      // Update our invoice with the new data. Use object.assign to copy fields
      // rather than reassigning the whole object. Will preserve fields added by
      // us, like invoice.qrcode_url
      else {
        Object.assign(this.invoice, data);
      }
    }

    // Update the expiry interval. If you don't clear the existing interval
    // first, multiple intervals might get created
    this.startExpiryCountdown();
  };
}

export default LndStore;
