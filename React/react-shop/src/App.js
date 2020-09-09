import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "react-bootstrap";
import "./css/LeftSidePanel.css";
import Home from "./components/HomeComponent";
import About from "./components/AboutComponent";
import Contact from "./components/ContactComponent";
import Error from "./components/ErrorComponent";

function App() {
  return (
    <div id="mainDiv">
      <BrowserRouter>
        <Switch>
          <Route path="/" component={Home} exact />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route component={Error} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
