import React, { useState } from "react";
import classNames from "classnames";
import { Card, Col, Container, Row, Accordion } from "react-bootstrap";
import NavBar from "./Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import Email from "./Email";

function Content({ toggle, isOpen }) {

  return (
    <Container style={{ width: "1000px" }} fluid className={classNames("content", { "is-open": isOpen })}>
      <NavBar toggle={toggle} name={'Dashboard'} />
      <Row>
        <Col md={12} lg={4}>
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="fs-1 ms-2" style={{ color: "#7e899b", scale: "1.5", fontFamily: "Comic" }}>15</div>
                <div className="lh-sm ms-5 text-secondary">Tuotetta odottaa tarkistamista</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={12} md={12} lg={4}>
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="fs-1 ms-2" style={{ color: "#7e899b", scale: "1.5", fontFamily: "Comic" }}>15</div>
                <div className="lh-sm ms-5 text-secondary">Tuotetta odottaa tarkistamista</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} lg={4}>
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="fs-1 ms-2" style={{ color: "#7e899b", scale: "1.5", fontFamily: "Comic" }}>15</div>
                <div className="lh-sm ms-5 text-secondary">Tuotetta odottaa tarkistamista</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Accordion>
        <Accordion.Item eventKey="0" className="border-0 shadow-sm">
          <Accordion.Header>

            <Row className='align-items-center w-100'>
              <Col xs={'auto'}>
                <FontAwesomeIcon icon={faCircleCheck} size="4x" style={{ color: "#7e899b" }} />
              </Col>
              <Col xs={'auto'} className="text-secondary lh-sm">Name: <br />Date: <br />Status: </Col>
            </Row>

          </Accordion.Header>
          <Accordion.Body style={{ backgroundColor: "white" }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
            minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

    </Container>
  );
}

export default Content;