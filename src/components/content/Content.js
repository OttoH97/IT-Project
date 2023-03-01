import React, { useState } from "react";
import classNames from "classnames";
import { Card, Col, Container, Row, Accordion, Button,Modal,Form } from "react-bootstrap";
import NavBar from "./Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { faExclamation } from "@fortawesome/free-solid-svg-icons";

function Content({ toggle, isOpen }) {

  const [show, setShow] = useState(false);
  const hideModal = () => setShow(false);
  const showModal = () => setShow(true);

  return (
    <Container style={{ width: "1000px" }} fluid className={classNames("content", { "is-open": isOpen })}>
      <NavBar toggle={toggle} name={'Dashboard'} />
      <Row>
        <Col md={12} lg={4}>
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="fs-1 ms-3" style={{ color: "#7e899b", scale: "1.5", fontFamily: "Comic" }}>200</div>
                <div className="lh-sm ms-5 text-secondary">Total of recent welds to show</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={12} md={12} lg={4}>
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="fs-1 ms-3" style={{ color: "#7e899b", scale: "1.5", fontFamily: "Comic" }}>178</div>
                <div className="lh-sm ms-5 text-secondary">Welds passed with status <strong>OK</strong></div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} lg={4}>
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="fs-1 ms-3" style={{ color: "#7e899b", scale: "1.5", fontFamily: "Comic" }}>22</div>
                <div className="lh-sm ms-5 text-secondary">Welds awaits for action to procedure </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Accordion className="mt-3">
        <Accordion.Item eventKey="0" className="border-0 shadow-sm">
          <Accordion.Header>

            <Row className='align-items-center w-100'>
              <Col xs={'auto'}>
                <FontAwesomeIcon icon={faCircleCheck} size="4x" style={{ color: "#95d795" }} />
              </Col>
              <Col xs={'auto'} className="text-secondary lh-sm">Name: <br />Date: <br />Status: </Col>
            </Row>

          </Accordion.Header>
          <Accordion.Body style={{ backgroundColor: "white" }} className='text-secondary'>
            <Row>
              <Col lg={12} className='h3'>#Name</Col>
              <Col lg={6}>Information of the product</Col>
            </Row>
            <Row className="mt-3 d-flex justify-content-between">
              <Col>Text</Col>
            </Row>
            
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion className="mt-3">
        <Accordion.Item eventKey="0" className="border-0 shadow-sm">
          <Accordion.Header>

            <Row className='align-items-center w-100'>
              <Col xs={'auto'}>
                <FontAwesomeIcon className="ms-4 me-4" icon={faExclamation} size="4x" style={{ color: "#f27a7a" }} />
              </Col>
              <Col xs={'auto'} className="text-secondary lh-sm">Name: <br />Date: <br />Status: </Col>
            </Row>

          </Accordion.Header>
          <Accordion.Body style={{ backgroundColor: "white" }} className='text-secondary'>
            <Row>
              <Col lg={12} className='h3'>#Name</Col>
              <Col lg={6}>Information of the product</Col>
            </Row>
            <Row className="mt-3">
              <Col>Text</Col>
              <Col className="align-items-center"><Button variant="primary" onClick={showModal}>Change Status</Button></Col>
            </Row>
            
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion className="mt-3">
        <Accordion.Item eventKey="0" className="border-0 shadow-sm">
          <Accordion.Header>

            <Row className='align-items-center w-100'>
              <Col xs={'auto'}>
                <FontAwesomeIcon icon={faCircleCheck} size="4x" style={{ color: "#95d795" }} />
              </Col>
              <Col xs={'auto'} className="text-secondary lh-sm">Name: <br />Date: <br />Status: </Col>
            </Row>

          </Accordion.Header>
          <Accordion.Body style={{ backgroundColor: "white" }} className='text-secondary'>
            <Row>
              <Col lg={12} className='h3'>#Name</Col>
              <Col lg={6}>Information of the product</Col>
            </Row>
            <Row className="mt-3 d-flex justify-content-between">
              <Col>Text</Col>
            </Row>
            
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion className="mt-3">
        <Accordion.Item eventKey="0" className="border-0 shadow-sm">
          <Accordion.Header>

            <Row className='align-items-center w-100'>
              <Col xs={'auto'}>
                <FontAwesomeIcon icon={faCircleCheck} size="4x" style={{ color: "#95d795" }} />
              </Col>
              <Col xs={'auto'} className="text-secondary lh-sm">Name: <br />Date: <br />Status: </Col>
            </Row>

          </Accordion.Header>
          <Accordion.Body style={{ backgroundColor: "white" }} className='text-secondary'>
            <Row>
              <Col lg={12} className='h3'>#Name</Col>
              <Col lg={6}>Information of the product</Col>
            </Row>
            <Row className="mt-3 d-flex justify-content-between">
              <Col>Text</Col>
            </Row>
            
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Modal show={show} onHide={hideModal}>
        <Modal.Header closeButton>
          <Modal.Title className="text-secondary">#Product</Modal.Title>
        </Modal.Header>
        <Modal.Body><Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label className="text-secondary">Add your name below for status change holder.</Form.Label>
              <Form.Control style={{border: "1px solid #ddd"}} type="text" placeholder="Name" autoFocus/>
            </Form.Group>
            
          </Form></Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideModal}>
            Close
          </Button>
          <Button variant="primary" onClick={hideModal}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}

export default Content;