import React, { Component } from "react";
import axios from "axios";
class UserComponent extends Component {
  state = {
    users: [],
  };
  componentDidMount() {
    axios
      .get("http://localhost:51229/api/User")
      .then((response) => {
        console.log(response);
        this.setState({ users: response.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }
  render() {
    return (
      <div className="container">
        <h3>Available Users Information</h3>
        <br></br>
        <div className="row h-100 justify-content-center align-items-center">
          <div className="col-10 col-md-6 col-lg-6">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>DOB</th>
                </tr>
              </thead>
              <tbody>
                {this.state.users.map((u) => (
                  <tr>
                    <td>{u.Name}</td>
                    <td>{u.Email}</td>
                    <td>{u.Dob}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default UserComponent;
