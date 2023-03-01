import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAlignLeft } from "@fortawesome/free-solid-svg-icons";
import { Navbar, Button, Nav } from "react-bootstrap";

function NavBar({ toggle, name }) {

  return (
    <Navbar bg="light" className="navbar shadow-sm p-3 mb-5 bg-white rounded" expand>
      <Button variant="outline-primary" onClick={toggle}>
        <FontAwesomeIcon icon={faAlignLeft} />
      </Button>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
      <Navbar.Brand className="ms-3 text-secondary">{name}</Navbar.Brand>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavBar;