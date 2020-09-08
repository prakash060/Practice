import React, { Component } from "react";
class ContactComponent extends Component {
  state = {};
  render() {
    return (
      <div className="container" style={{ backgroundColor: "red" }}>
        <div className="row h-100 justify-content-center align-items-center">
          <div className="col-10 col-md-6 col-lg-6">
            <h1>This is "Contact" page.!</h1>
          </div>
        </div>
      </div>
    );
  }
}

export default ContactComponent;
