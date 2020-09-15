import React from 'react';
import { observer } from 'mobx-react';
import StoreContext from 'lib/StoreContext';
import styles from './ConnectionStatus.scss';

@observer
class ConnectionStatus extends React.Component {
  static contextType = StoreContext;

  get loadingGlobalsView() {
    return (
      <div className={styles.disconnected}>
        Loading globals... <span className={styles.dot}></span>
      </div>
    );
  }

  get connectedView() {
    return (
      <div className={styles.connected}>
        Connected <span className={styles.dot}></span>
      </div>
    );
  }

  get disconnectedView() {
    return (
      <div className={styles.disconnected}>
        Disconnected <span className={styles.dot}></span>
      </div>
    );
  }

  get errorView() {
    const { error } = this.context.lndStore;
    return (
      <div className={styles.error}>
        Error: {error}
      </div>
    );
  }

  render() {
    const {
      globals
    } = this.context.globalsStore;

    const {
      open,
      error
    } = this.context.lndStore;

    let view;
    let className;

    if (error) {
      view = this.errorView;
      className = styles.error;
    }
    else if (!globals) {
      view = this.loadingGlobalsView;
      className = styles.loadingGlobals;
    }
    else if (!open) {
      view = this.disconnectedView;
      className = styles.disconnected;
    }
    else {
      view = this.connectedView;
      className = styles.connected;
    }

    return (
      <div className={`${styles.connectionStatus} ${className}`}>
        {view}
      </div>
    )
  }
}

export default ConnectionStatus;