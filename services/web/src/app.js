import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { observer } from 'mobx-react';
import StoreContext from 'lib/StoreContext';
import GlobalsStore from 'stores/GlobalsStore';
import LndStore from 'stores/LndStore';
import styles from './app.scss';

// Components
import Home from './components/Home';
import About from './components/About';
import ConnectionStatus from './components/ConnectionStatus';

@observer
class App extends React.Component {
  constructor(props) {
    super(props);

    this.globalsStore = new GlobalsStore();
    this.lndStore = new LndStore();

    this.globalsStore.init().then(this.setupLndStore);
  }

  setupLndStore = () => {
    const lndGatewayHost = this.globalsStore.globals.LND_GATEWAY_HOST;
    this.lndStore.init(lndGatewayHost);
  }

  render() {
    if (!this.globalsStore.globals) {
      return (
        <div className={styles.loading}>
          Loading...
        </div>
      );
    }

    return (
      <StoreContext.Provider value={{
        globalsStore: this.globalsStore,
        lndStore: this.lndStore,
      }}>
        <div className={styles.app}>
          <Router>
            <Route path="/about">
              <About />
            </Route>
            <Route exact path="/">
              <Home />
            </Route>
          </Router>
          <ConnectionStatus />
        </div>
      </StoreContext.Provider>
    );
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById("root")
);
