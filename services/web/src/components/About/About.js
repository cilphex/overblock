import React from "react"
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import { lndStore } from 'lib/globals';

import styles from './About.scss';

@observer
class About extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fixed: false
    };
  }

  fix = () => {
    this.setState({
      fixed: true
    });
  };

  render() {
    const fixClass = this.state.fixed ? null : styles.fixme;

    return (
      <div className={`${styles.content} ${fixClass}`}>
        <h1>FAQ</h1>

        <h2>What is Overblock?</h2>
        <p>Overblock is a website for testing Lightning payments.</p>

        <h2>Why can't I buy the nuke?</h2>
        <p>Very small payments are not widely supported yet. It is technically
        possible, but all nodes in the path must support payments as small as
        0.001 sat.</p>
        <p>You might get lucky, but you probably shouldn't have a nuke
        anyway.</p>

        <h2>Is it open source?</h2>
        <p>Yes. {'<add link when ready>'}</p>

        <div className={styles.footer}>
          <Link to="/">Home</Link>
          {fixClass && (
            <a className={styles.fix} onClick={this.fix}>👇</a>
          )}
        </div>
      </div>
    );
  }
};

export default About;