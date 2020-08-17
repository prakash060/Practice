import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";

export default class HomeComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: "",
      email: "",
      dob: "",
    };
  }

  inputChangeHandler = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = (e) => {
    console.log(this.state);
    e.preventDefault();
  };

  render() {
    return (
      <div className="container h-100">
        <div className="row h-100 justify-content-center align-items-center">
          <div className="col-10 col-md-6 col-lg-4">
            <form onSubmit={this.handleSubmit}>
              <h1>Welcome Form !</h1>
              <div className="form-group">
                <label htmlFor="userName">User Name:</label>
                <input
                  type="text"
                  className="form-control"
                  id="userName"
                  placeholder="Enter User Name"
                  name="userName"
                  value={this.state.userName}
                  onChange={this.inputChangeHandler}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="text"
                  className="form-control"
                  id="email"
                  placeholder="Enter Email"
                  name="email"
                  value={this.state.email}
                  onChange={this.inputChangeHandler}
                />
              </div>
              <div className="form-group">
                <label htmlFor="dob">Date Of Birth:</label>
                <input
                  type="date"
                  className="form-control"
                  id="dob"
                  placeholder="Enter date of birth"
                  name="dob"
                  value={this.state.dob}
                  onChange={this.inputChangeHandler}
                />
              </div>
              <button
                type="submit"
                className="btn btn-secondary btn-customized"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
