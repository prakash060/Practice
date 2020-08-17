import React, { Component } from "react";
import "../css/LeftSidePanel.css";
import { Nav } from "react-bootstrap";

class LeftPaneComponent extends Component {
  state = {};

  openNav = (e) => {
    e.preventDefault();
    document.getElementById("leftSidepanel").style.width = "250px";
  };

  closeNav = (e) => {
    e.preventDefault();
    document.getElementById("leftSidepanel").style.width = "0";
  };

  render() {
    return (
      <div>
        <div id="leftSidepanel" className="sidepanel">
          <Nav.Link className="closebtn" onClick={this.closeNav}>
            {" "}
            ×{" "}
          </Nav.Link>
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="about">About</Nav.Link>
          <Nav.Link href="contact">Contact</Nav.Link>
        </div>

        <button className="openbtn" onClick={this.openNav}>
          ☰
        </button>
      </div>
    );
  }
}
export default LeftPaneComponent;
