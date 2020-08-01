import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";

// Components
import Home from './components/Home';
import About from './components/About';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <Route path="/about">
          <About />
        </Route>
        <Route exact path="/">
          <Home />
        </Route>
      </Router>
    )
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById("root")
);
