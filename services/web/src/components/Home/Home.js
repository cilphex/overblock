import React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import StoreContext from 'lib/StoreContext';
import styles from './Home.scss';
import products from './products';

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

@observer
class Home extends React.Component {
  static contextType = StoreContext;

  constructor(props) {
    super(props);

    this.paymentRequestRef = React.createRef();
    this.state = {
      product: null,
      paymentRequestCopied: false,
    };
  }

  showProduct = (product) => {
    this.setState({ product });
  };

  invoiceSettledView = () => {
    return (
      <div className={styles.invoicePaid}>
        🎊 Paid 🎊
      </div>
    )
  };

  copyPaymentRequest = () => {
    this.paymentRequestRef.current.select();
    document.execCommand('copy');
    this.setState({
      paymentRequestCopied: true
    });
    clearTimeout(this.paymentRequestCopiedTimeout);
    this.paymentRequestCopiedTimeout = setTimeout(() => {
      this.setState({ paymentRequestCopied: false });
    }, 3000);
  };

  expiryTextView = () => {
    const { invoice } = this.context.lndStore;

    if (invoice.secondsRemaining === undefined) {
      return "...";
    }

    if (invoice.secondsRemaining <= 0) {
      return <div className={styles.danger}>
        This invoice has expired
      </div>;
    }

    const minutes = Math.floor(invoice.secondsRemaining / 60);
    let seconds = (invoice.secondsRemaining % 60);
        seconds = seconds < 10 ? `0${seconds}` : seconds;
    const waitingClass = minutes < 5 ? styles.danger : '';

    return <div>
      Waiting for payment &mdash;&nbsp;
      <span className={waitingClass}>{minutes}:{seconds}</span>
    </div>;
  };

  invoicePendingView = () => {
    const { invoice } = this.context.lndStore;

    return (
      <div className={styles.invoice}>
        <a href={`lightning:${invoice.payment_request}`} className={styles.qrcode}>
          <img src={invoice.qrcode_url} />
        </a>
        <div className={styles.paymentRequestString}>
          <input
            type="text"
            value={invoice.payment_request}
            ref={this.paymentRequestRef}
            onClick={(e) => e.target.select()}
            readOnly
          />
          <button onClick={this.copyPaymentRequest}>
            {this.state.paymentRequestCopied ? <em>Copied!</em> : "Copy"}
          </button>
        </div>
        <div className={styles.waiting}>
          {this.expiryTextView()}
        </div>
      </div>
    );
  };

  buyButtonView = () => {
    const { product } = this.state;
    const { waitingForInvoice } = this.context.lndStore;

    return (
      <div className={styles.buyButton}>
        <button onClick={this.createInvoice} disabled={waitingForInvoice}>
          Buy it
        </button>
      </div>
    );
  };

  checkoutStatusView = () => {
    const { invoice } = this.context.lndStore;

    if (invoice) {
      if (invoice.settled) {
        return this.invoiceSettledView();
      }
      return this.invoicePendingView();
    }
    return this.buyButtonView();
  };

  checkoutView = () => {
    const { product } = this.state;
    const { invoice } = this.context.lndStore;
    const tiltClass = product.tilt ? styles.tilt : null;
    const cancelText = invoice && invoice.settled ? 'Close' : 'Cancel';

    return (
      <div className={styles.checkout} onClick={this.cancelCheckout}>
        <div className={styles.product} onClick={this.stopPropagation}>
          <div className={styles.name}>
            {product.name}
          </div>
          <div className={styles.image}>
            <img className={tiltClass} src={`/public/images/products/${product.image}`}/>
          </div>
          <div className={styles.details}>
            <div className={styles.description}>
              <p><strong>Description</strong></p>
              <p>
                {product.descriptions ? (
                  product.descriptions[Math.floor(Math.random() * product.descriptions.length)]
                ):(
                  product.description
                )}
              </p>
            </div>
            <div className={styles.price}>
              {numberWithCommas(product.price)}&nbsp;
              {product.price === 1 ? 'sat' : 'sats'}
            </div>
          </div>

          {this.checkoutStatusView()}

          <div className={styles.cancelButton} >
            <a onClick={this.cancelCheckout}>
              {cancelText}
            </a>
          </div>
        </div>
      </div>
    );
  };

  stopPropagation = (e) => {
    e.stopPropagation();
  };

  cancelCheckout = () => {
    this.setState({ product: null });
    this.context.lndStore.clearInvoice();
  };

  createInvoice = () => {
    const { product } = this.state;

    this.context.lndStore.createInvoice(product.price, product.name);
  };

  productView = (product, i) => {
    const { product: selectedProduct } = this.state;
    const selectedClass = product == selectedProduct ? styles.selected : null;

    return (
      <div className={`${styles.deal} ${selectedClass}`} key={i} onClick={() => this.showProduct(product)}>
        <div className={styles.image}>
          <img src={`/public/images/products/${product.image}`}/>
        </div>
        <div className={styles.desc}>
          <div>{product.name}</div>
          <div className={styles.price}>
            {numberWithCommas(product.price)}&nbsp;
            {product.price === 1 ? 'sat' : 'sats'}
          </div>
        </div>
      </div>
    );
  };

  errorView = () => {
    const { error, clearError } = this.context.lndStore;

    return (
      <div className={styles.error}>
        Error: {error}
        {' '}
        (<a onClick={clearError}>Clear</a>)
      </div>
    );
  };

  render() {
    const { error } = this.context.lndStore;
    const { product } = this.state;

    return (
      <div className={styles.content}>
        {error && this.errorView()}
        {product && this.checkoutView()}

        <div className={styles.main}>
          {/* Header */}
          <div className={styles.header}>
            <span className={styles.logo}></span>
            <h1>overblock <span>Testnet</span></h1>
          </div>

          {/* Jumbotron */}
          <div className={styles.jumbo}>
            <div className={styles.shipping}>
              No shipping on EVERYTHING!
            </div>
            <div className={styles.couch}/>
          </div>

          {/* Products */}
          <h2>Top Deals</h2>
          <div className={styles.deals}>
            {products.map((product, i) =>
              this.productView(product, i))
            }
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p>Overblock.dev ®</p>
          <p>Buy fake items using the Lightning network on testnet.</p>
          <p><Link to="/about">About</Link></p>
          <p><a href="https://github.com/cilphex/overblock" target="_blank">Open source</a></p>
        </div>
      </div>
    );
  }
}

export default Home;
