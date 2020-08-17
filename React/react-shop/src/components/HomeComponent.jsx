import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";

export default class HomeComponent extends Component {
  render() {
    return (
      <div class="container h-100">
        <div class="row h-100 justify-content-center align-items-center">
          <div class="col-10 col-md-8 col-lg-4">
            <form>
              <h1>Welcome Form !</h1>
              <div class="form-group">
                <label for="username">User Name:</label>
                <input
                  type="text"
                  class="form-control username"
                  id="username"
                  placeholder="Enter User Name"
                  name="username"
                />
              </div>
              <div class="form-group">
                <label for="email">Email:</label>
                <input
                  type="text"
                  class="form-control email"
                  id="email"
                  placeholder="Enter Email"
                  name="email"
                />
              </div>
              <button type="submit" class="btn btn-secondary btn-customized">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
