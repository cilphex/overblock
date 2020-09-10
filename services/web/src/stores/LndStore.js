import { observable } from 'mobx';
import QRCode from 'qrcode';

class LndStore {
  lndGatewayHost = null;
  ws = null;
  expiration_interval = null;

  @observable open = false;
  @observable waitingForInvoice = false;
  @observable invoice = null;
  @observable error = null;

  init(lndGatewayHost) {
    this.lndGatewayHost = lndGatewayHost;
    this.setupSocket();
  }

  setupSocket() {
    try {
      this.ws = new WebSocket(this.lndGatewayHost);
    }
    catch(err) {
      this.error = 'Could not create socket connection';
      return;
    }
    this.ws.onopen = this.handleSocketOpen;
    this.ws.onmessage = this.handleSocketMessage;
    this.ws.onerror = this.handleSocketError;
    this.ws.onclose = this.handleSocketClose;
    this.setupSocketKeepAlive();
  }

  setupSocketKeepAlive() {
    setInterval(() => {
      if (this.ws && this.ws.readyState == WebSocket.OPEN) {
        const message = { type: 'keep_alive' };
        this.ws.send(JSON.stringify(message));
      }
    }, 10000);
  }

  handleSocketOpen = () => {
    console.log('socket open');
    this.open = true;
  };

  handleSocketMessage = (message) => {
    const data = JSON.parse(message.data);

    switch(data.message_type) {
      case 'invoice':
        this.handleInvoiceMessage(data);
        break;
      case 'error':
        this.handleErrorMessage(data);
        break;
      default:
        console.log(`got unknown messageType: ${data.message_type}`);
    }
  };

  handleSocketError = (e) => {
    console.log('socket error event', e);
    this.error = 'Socket error';
  };

  handleSocketClose = () => {
    console.log('socket close');
    this.open = false;
  };

  // ==========================================================================
  // Errors

  handleErrorMessage = (data) => {
    console.log('handleErrorMessage');
    this.error = data.message;
  };

  clearError = () => {
    this.error = null;
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

  startExpirationCountdown = () => {
    console.log('start expiration countdown');
    clearInterval(this.expiration_interval);
    this.expiration_interval = setInterval(this.updateExpirationCountdown, 1000);
  };

  updateExpirationCountdown = () => {
    this.invoice.secondsRemaining -= 1;
    if (this.invoice.settled || this.invoice.secondsRemaining <= 0) {
      clearInterval(this.expiration_interval);
      console.log('clear expiration countdown')
    }
    else {
      console.log('seconds remaining', this.invoice.secondsRemaining);
    }
  };

  clearInvoice = () => {
    console.log('clear invoice');
    clearInterval(this.expiration_interval);
    this.invoice = null;
    this.waitingForInvoice = false;
  };

  async handleInvoiceMessage(invoiceData) {
    console.log('handleInvoiceMessage', invoiceData);
    this.waitingForInvoice = false;

    // We're only interested in generic messages that are updates to an invoice
    // that we're already looking at. That should be the case at this point
    // anyway, but have this check just in case.
    // Copy the expiry value to a secondary field that won't be overwritten with
    // further updates later on.
    if (!this.invoice) {
      this.invoice = invoiceData;
      this.invoice.secondsRemaining = this.invoice.expiry;
      this.invoice.qrcode_url = await QRCode.toDataURL(this.invoice.payment_request);
      this.startExpirationCountdown();
      console.log('created invoice', this.invoice.payment_request);
    }

    // If an invoice already exists...
    else {
      // Check to ensure the payment request matches. We shouldn't receive
      // messages that don't match anyway, but check just in case.
      if (invoiceData.payment_request != this.invoice.payment_request) {
        return;
      }
      // Update our invoice with the new data. Use object.assign to copy fields
      // rather than reassigning the whole object. Will preserve fields added by
      // us, like invoice.qrcode_url
      else {
        Object.assign(this.invoice, invoiceData);
      }
    }
  };
}

export default LndStore;
