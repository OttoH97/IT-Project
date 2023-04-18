import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faDashboard,faEnvelope,faLink,faTimes} from "@fortawesome/free-solid-svg-icons";
import { Nav, Button, Image, Badge } from "react-bootstrap";
import {LinkContainer} from 'react-router-bootstrap'
import classNames from "classnames";
import logo from './fronius.png'

const Sidebar = ({ toggle, isOpen }) => {

  return (
    <div className={classNames("sidebar", { "is-open": isOpen })}>
        <Nav className="flex-column">
        <div className="sidebar-header">
          {isOpen === true ? <FontAwesomeIcon onClick={toggle} icon={faTimes} pull="right" size="2x" className="mt-4 me-4 d-block d-sm-none" style={{right:"25px",cursor:"pointer"}} /> : null}

        <Image className="p-4" width={240} src={logo}></Image>
      </div>

        <span className="ms-3 my-3 fw-bold text-light">WELDCUBE <Badge style={{borderRadius:"3px", backgroundColor:"#e2001a"}}>PREMIUM</Badge></span>

        <LinkContainer to='/' >
          <Nav.Link className="text-secondary d-none d-sm-block"><FontAwesomeIcon icon={faDashboard} className="me-2" />Dashboard</Nav.Link>
        </LinkContainer>

        <LinkContainer to='/' onClick={toggle}>
          <Nav.Link className="text-secondary d-block d-sm-none"><FontAwesomeIcon icon={faDashboard} className="me-2" />Dashboard</Nav.Link>
        </LinkContainer>

        <LinkContainer to='/mail'>
          <Nav.Link className="text-secondary d-none d-sm-block"><FontAwesomeIcon icon={faEnvelope} className="me-2" />Mail List</Nav.Link>
        </LinkContainer>
        
        <LinkContainer to='/mail' onClick={toggle}>
          <Nav.Link className="text-secondary d-block d-sm-none"><FontAwesomeIcon icon={faEnvelope} className="me-2" />Mail List</Nav.Link>
        </LinkContainer>

        <LinkContainer to='http://weldcube.ky.local/Home/Dashboard'>
          <Nav.Link className="text-secondary d-none d-sm-block"><FontAwesomeIcon icon={faLink} className="me-2" style={{fontSize:"12px"}} />WeldCube</Nav.Link>
        </LinkContainer>

        <LinkContainer to='http://weldcube.ky.local/Home/Dashboard' onClick={toggle}>
          <Nav.Link className="text-secondary d-block d-sm-none"><FontAwesomeIcon icon={faLink} className="me-2" />WeldCube</Nav.Link>
        </LinkContainer>
      </Nav>
      </div>
  );
};

export default Sidebar;