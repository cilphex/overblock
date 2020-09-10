import React from 'react';
import { observer } from 'mobx-react';
import StoreContext from 'lib/StoreContext';
import styles from './ConnectionStatus.scss';

@observer
class ConnectionStatus extends React.Component {
  static contextType = StoreContext;

  get readyView() {
    return <div className={styles.connected}>
      Connected <span className={styles.dot}></span>
    </div>;
  }

  get loadingView() {
    return <div className={styles.disconnected}>
      Disconnected <span className={styles.dot}></span>
    </div>;
  }

  get errorView() {
    const { error } = this.context.lndStore;
    return <div className={styles.error}>
      Error: {error}
    </div>;
  }

  render() {
    const {
      open,
      error
    } = this.context.lndStore;

    return (
      <div className={styles.connectionStatus}>
        {(() => {
          if (error) {
            return this.errorView;
          }
          if (!open) {
            return this.loadingView;
          }
          return this.readyView;
        })()}
      </div>
    )
  }
}

export default ConnectionStatus;