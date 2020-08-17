import React, { Component } from "react";
class ErrorComponent extends Component {
  state = {};
  render() {
    return (
      <div>
        <h1>Error: Specified path not found.!</h1>
      </div>
    );
  }
}

export default ErrorComponent;
