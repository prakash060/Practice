import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from "./components/HomeComponent";
import About from "./components/AboutComponent";
import Contact from "./components/ContactComponent";
import TopNav from "./components/TopNavComponent";
import Error from "./components/ErrorComponent";
import LeftPane from "./components/LeftPaneComponent";

function App() {
  return (
    <div>
      <BrowserRouter>
        <TopNav />
        <LeftPane />
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
