import React, { Component } from "react";
import "../css/ErrorPage.css";
class ErrorComponent extends Component {
  state = {};
  render() {
    return (
      <div>
        <div className="row h-100 justify-content-center align-items-center">
          <div className="col-10 col-md-4 col-lg-4">
            <div class="alert alert-danger center">
              <h3>Danger! Something went wrong.!</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorComponent;
