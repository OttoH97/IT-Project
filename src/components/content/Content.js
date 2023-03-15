import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { Card, Col, Container, Row, Accordion, Button,Modal,Form } from "react-bootstrap";
import NavBar from "./Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { faChevronLeft, faChevronRight, faExclamation } from "@fortawesome/free-solid-svg-icons";

import data from '../../data.json';
import ReactPaginate from 'react-paginate';

function Content({ toggle, isOpen }) {


  // Welds from weldcube API
  const [welds, setWelds] = useState([]);
  const [filterState, setFilterState] = useState("all");

  useEffect(() => {
    setWelds(data.WeldInfos);
}, []);

  // Modal
  const [show, setShow] = useState(false);
  const hideModal = () => setShow(false);
  const showModal = () => setShow(true);

  // Filters

  const handleFilter = (filter) => {
    setFilterState(filter);
  };

  const filteredWelds = welds.filter((weld) => {
    if (filterState === "all") {
      return true;
    } else if (filterState === "ok") {
      return weld.State === "Ok";
    } else if (filterState === "not-ok") {
      return weld.State === "Not ok";
    }
  });

  //Pagination
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageChange = ({ selected: selectedPage }) => {
    setCurrentPage(selectedPage);
  };

  const totalPages = Math.ceil(filteredWelds.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredWelds.slice(startIndex, endIndex);


// Convert API timestamp to human readable format
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  };
  return date.toLocaleString('en-US', options);
}

let rows = currentItems.map((x) => {
  const { Id, Timestamp, ProcessingStepNumber, PartSerialNumber, MachineType, MachineSerialNumber, Details, State, Welder } = x;

  return (
    <Accordion className="mt-3">
        <Accordion.Item eventKey="0" className="border-0 shadow-sm">
          <Accordion.Header>
            <Row className='align-items-center w-100'>
              <Col xs={'auto'}>
              <FontAwesomeIcon icon={State === "Not ok" ? faExclamation : faCircleCheck} size="4x" style={{ color: State === "Not ok" ? "#ff8a8a" : "#95d795" }} className={State === "Not ok" ? "ms-4 me-4" : ""} />
              </Col>
              <Col xs={'auto'} className="text-secondary lh-sm">Name: #{ProcessingStepNumber} <br />Date: {formatTimestamp(Timestamp)}<br />Status: {State}</Col>
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
  );
});

  return (
    <Container style={{ width: "1000px" }} fluid className={classNames("content", { "is-open": isOpen })}>
      <NavBar toggle={toggle} name={'Dashboard'} />
      <Row>
        <Col md={12} lg={4} onClick={() => handleFilter("all")} className='zoom user-select-none'>
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="fs-1 ms-3" style={{ color: "#7e899b", scale: "1.5", fontFamily: "Comic" }}>{welds.length}</div>
                <div className="lh-sm ms-5 text-secondary">Total of recent welds to show</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={12} md={12} lg={4} onClick={() => handleFilter("ok") } className='zoom user-select-none'>
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="fs-1 ms-3" style={{ color: "#7e899b", scale: "1.5", fontFamily: "Comic" }}>{welds.filter((weld) => weld.State === "Ok").length}</div>
                <div className="lh-sm ms-5 text-secondary">Welds passed with status <strong>OK</strong></div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} lg={4} onClick={() => handleFilter("not-ok")} className='zoom user-select-none'>
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="fs-1 ms-3" style={{ color: "#7e899b", scale: "1.5", fontFamily: "Comic" }}>{welds.filter((weld) => weld.State === "Not ok").length}</div>
                <div className="lh-sm ms-5 text-secondary">Welds awaits for action to procedure </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
{filterState === 'all' ? <h6 className="mt-3 text-secondary">Showing All Recent Welds</h6> : <h6 className="mt-3 text-secondary">Showing Welds Status "{filterState}"</h6>}
 {rows} 
 <Row className="justify-content-center mt-3">
        <Col xs="auto">
          <ReactPaginate
            previousLabel={<FontAwesomeIcon icon={faChevronLeft}/>}
            nextLabel={<FontAwesomeIcon icon={faChevronRight}/>}
            breakLabel={<Button disabled>...</Button>}
            pageCount={totalPages}
            onPageChange={handlePageChange}
            containerClassName="pagination"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            activeClassName="active"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            disabledClassName="disabled"
          />
        </Col>
      </Row>

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