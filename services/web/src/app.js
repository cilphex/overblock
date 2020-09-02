import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { observer } from 'mobx-react';
import StoreContext from 'lib/StoreContext';
import GlobalsStore from 'stores/GlobalsStore';
import LndStore from 'stores/LndStore';

// Components
import Home from './components/Home';
import About from './components/About';

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
      return <>Loading...</>;
    }

    if (!this.lndStore.opened) {
      return <>Connecting...</>;
    }

    return (
      <StoreContext.Provider value={{
        globalsStore: this.globalsStore,
        lndStore: this.lndStore,
      }}>
        <Router>
          <Route path="/about">
            <About />
          </Route>
          <Route exact path="/">
            <Home />
          </Route>
        </Router>
      </StoreContext.Provider>
    );
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById("root")
);
