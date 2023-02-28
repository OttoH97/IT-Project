import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faDashboard,faEnvelope,faTimes} from "@fortawesome/free-solid-svg-icons";
import { Nav, Button, Image, Badge } from "react-bootstrap";
import {LinkContainer} from 'react-router-bootstrap'
import classNames from "classnames";
import logo from './fronius.png'

const Sidebar = ({ toggle, isOpen }) => {

  return (
    <div className={classNames("sidebar", { "is-open": isOpen })}>
      <Nav className="flex-column">
        <div className="sidebar-header">
        <Button variant="link" onClick={toggle} style={{ color: "#fff" }} className="mt-4">
          <FontAwesomeIcon icon={faTimes} pull="right" size="xs" />
        </Button>
        <Image className="p-4" width={240} src={logo}></Image>
      </div>

      
        <span className="ms-3 my-3 fw-bold text-light">WELDCUBE <Badge style={{borderRadius:"3px", backgroundColor:"#e2001a"}}>PREMIUM</Badge></span>

        <LinkContainer to='/'>
          <Nav.Link className="text-secondary" href="/"><FontAwesomeIcon icon={faDashboard} className="me-2" />Dashboard</Nav.Link>
        </LinkContainer>

        <LinkContainer to='/mail'>
          <Nav.Link className="text-secondary" href="/"><FontAwesomeIcon icon={faEnvelope} className="me-2" />Mail List</Nav.Link>
        </LinkContainer>
      </Nav>
    </div>
  );
};

export default Sidebar;