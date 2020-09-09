import React, { Component } from "react";
class AboutComponent extends Component {
  state = {};
  render() {
    return (
      <div className="container">
        <div className="row h-100 justify-content-center align-items-center">
          <div className="col-10 col-md-6 col-lg-6">
            <h1>This is "About" page.!</h1>
          </div>
        </div>
      </div>
    );
  }
}

export default AboutComponent;
