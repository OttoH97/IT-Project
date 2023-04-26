import React, { useState, useEffect, useMemo } from "react";
import classNames from "classnames";
import { Card, Col, Container, Row, Accordion, Button, Modal, Form, Table, Badge, DropdownButton, InputGroup } from "react-bootstrap";
import NavBar from "./Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { faCheck, faCross, faExclamation, faLink, faXmark } from "@fortawesome/free-solid-svg-icons";

import axios from 'axios';
import Pagination from "../pagination";


function Content({ toggle, isOpen }) {

  // Welds from weldcube API
  const [welds, setWelds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [filter, setFilter] = useState('all');

  const [totalOk, setTotalOk] = useState(0);
  const [totalNotOk, setTotalNotOk] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [weldID, setWeldID] = useState('')
  const [weldDetailToShow, setWeldDetailToShow] = useState([])

  // Section details
  const [sectionDetails, setSectionDetails] = useState([]);


  const [activeKey, setActiveKey] = useState(null);
  const [explanation, setExplanation] = useState('');


  // Modal
  const [show, setShow] = useState(false);
  const hideModal = () => setShow(false);
  const showModal = () => setShow(true);

  // Haetaan yleiset statiikat
  useEffect(() => {
    axios.get(`http://localhost:4000/welds?pageSize=1`)
      .then(response => {
        setTotalNotOk(response.data.totalNotOk);
        setTotalOk(response.data.totalOk);

      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  // Fetch all welds
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      try {
        const response = await axios.get(`http://localhost:4000/welds?pageNumber=${pageNumber}&pageSize=${pageSize}&filter=${filter}`);
        setWelds(response.data.welds);
        setTotalPages(response.data.totalPages)
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }

    fetchData();
  }, [pageNumber, pageSize, filter]);

  // Haetaan weldin actualvalues
  const handleToggle = (id) => {
    axios.get(`http://localhost:4000/welds/${id}/Sections`)
      .then(response => {
        setSectionDetails(response.data.SectionDetails)
      })
      .catch(error => {
        console.log(error);
      });
  };

  // Pagination
  function handlePageChange(page) {
    setPageNumber(page);
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const dateString = date.toLocaleDateString('fi');
    const timeString = date.toLocaleTimeString('fi', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    return `${dateString} klo. ${timeString.replace('.', ':')}`;
  }

  const handleAccordionClick = (eventKey) => {
    setActiveKey(eventKey === activeKey ? null : eventKey);
  };

  const handleExplanationChange = (event) => {
    setExplanation(event.target.value);
  };

  const handleSubmit = () => {
    const user = 'admin';
    axios.post(`http://localhost:4000/api/v4/Welds/${weldID}/ChangeState?explanation=${explanation}&user=${user}`)
    hideModal();
  };

  let rows = welds.map((weld, index) => {
    return (
      <Accordion key={index} id={index} className="mt-3" onClick={() => { setWeldID(weld.Id); handleToggle(weld.Id); setWeldDetailToShow(weld) }} activeKey={activeKey} onSelect={handleAccordionClick}>
        <Accordion.Item eventKey={index} className="border-0 shadow-sm">
          <Accordion.Header>
            <Row className='align-items-center w-100' style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
              <Col xs={'auto'} onClick={showModal} style={{ zIndex: "2" }}>
                <FontAwesomeIcon icon={weld.State === "NotOk" || weld.State === 'NotOkEdited' ? faExclamation : faCircleCheck} size="4x" style={{ color: weld.State === "NotOk" || weld.State === 'NotOkEdited' ? "#ff8a8a" : "#95d795" }} className={weld.State === "NotOk" || weld.State === 'NotOkEdited' ? "ms-4 me-4" : ""} />
              </Col>
              <Col xs={'auto'} className="text-secondary lh-sm">Date: {formatTimestamp(weld.Timestamp)}<br />Name: {weld.PartArticleNumber === '' ? '' : weld.PartArticleNumber} {weld.PartSerialNumber === '' ? 'N/A' : '#' + weld.PartSerialNumber}<br />Status: {weld.State}</Col>
            </Row>

            <Col xs={'auto'} className="d-none d-lg-block">
              {weld.Details?.LimitViolations?.length > 0 && (
                <span className="d-block p-1 rounded fw-bold text-white me-3" style={{ border: weld.State?.trim().toLowerCase() === 'okedited' ? "1px solid rgb(130, 130, 130)" :"1px solid rgb(255, 138, 138)", backgroundColor: weld.State?.trim().toLowerCase() === 'okedited' ? '#808080b2' : "rgba(255, 138, 138, 0.82)", fontSize: "12px" }}>
                  Violations: {weld.Details.LimitViolations.map((violation, index) => (
                    <span key={index}>{violation.ValueType} {violation.ViolationType === "Upper" ? "++" : (violation.ViolationType === "Lower" ? "--" : "")} </span>
                  ))}
                </span>
              )}
            </Col><br />
            <Col xs={'auto'} className="d-none d-lg-block">
              {weld.Errors?.length > 0 && (
                <span className="d-block p-1 rounded fw-bold text-white me-3" style={{ backgroundColor: "rgba(255, 138, 138, 0.82)", fontSize: "12px" }}>
                  Error Code: {weld.Errors.map((error, index) => (
                    <span>{error.ErrorCode}</span>
                  ))}
                </span>
              )}
            </Col>
          </Accordion.Header>
          <Accordion.Body style={{ backgroundColor: "white" }} className='text-secondary'>
            <Row className='g-3'>
              <Col md={12} className="d-lg-none">
                {weld.Details?.LimitViolations?.length > 0 ? (
                  <span className="d-block p-1 rounded fw-bold text-white m-0 text-center" style={{ border: "1px solid rgb(255, 138, 138)", backgroundColor: "rgba(255, 138, 138, 0.82)", fontSize: "12px" }}>
                    Violations: {weld.Details.LimitViolations.map((violation, index) => (
                      <span key={index}>{violation.ValueType} {violation.ViolationType === "Upper" ? "++" : (violation.ViolationType === "Lower" ? "--" : "")} </span>
                    ))}
                  </span>
                ) : <span className="d-lg-none d-block p-1 rounded fw-bold text-white mt-0 text-center" style={{ border: "1px solid rgb(149, 215, 149)", backgroundColor: "rgba(149, 215, 149, 0.82)", fontSize: "12px" }}>No Violations Found!</span>}
              </Col>
              <Col md={12} className="d-lg-none">
                {weld.Errors?.length > 0 ? (
                  <span className="d-block p-1 rounded fw-bold text-white m-0 text-center" style={{ backgroundColor: "rgba(255, 138, 138, 0.82)", fontSize: "12px" }}>
                    Error Code: {weld.Errors.map((error, index) => (
                      <span>{error.ErrorCode}</span>
                    ))}
                  </span>
                ) : <span className="d-lg-none d-block p-1 rounded fw-bold text-white mt-0 text-center user-select-none" style={{ border: "1px solid rgb(149, 215, 149)", backgroundColor: "rgba(149, 215, 149, 0.82)", fontSize: "12px" }}>No Errors Found!</span>}
              </Col>
              <Col md={4}><div className="rounded bg-light p-3 d-block" style={{ border: "1px solid #dee2e6" }}>
                <div className="fw-bold">Start Time</div>
                <div>{weldDetailToShow?.Timestamp ? formatTimestamp(weldDetailToShow.Timestamp) : 'Not found'}</div>
              </div>
              </Col>

              <Col md={4}><div className="rounded bg-light p-3 d-block" style={{ border: "1px solid #dee2e6" }}>
                <div className="fw-bold">Duration</div>
                <div>{weldDetailToShow?.Duration ? (weldDetailToShow.Duration).toFixed(1) + ' s' : 'Not found'}</div>
              </div>
              </Col>

              {weldDetailToShow?.Details?.SingleStats?.map((stat, index) => {
                if (stat.Name === "Wire consumption (length)" || stat.Name === "Wire consumption (weight)" || stat.Name === "Wire consumption (volume)") {
                  return null; // exclude individual wire consumption stats
                } else {
                  const name = stat.Name;
                  const value = stat.Value;
                  const unit = stat.Unit;

                  // Combine wire consumption stats in one text
                  if (name === "Wire consumption (length)") {
                    return null;
                  } else if (name === "Wire consumption (weight)") {
                    const lengthStat = weldDetailToShow?.Details?.SingleStats?.find((s) => s.Name === "Wire consumption (length)");
                    const volumeStat = weldDetailToShow?.Details?.SingleStats?.find((s) => s.Name === "Wire consumption (volume)");
                    if (!lengthStat || !volumeStat) {
                      return null; // missing stats, skip
                    }
                    const wireText = `${name.split(" ")[2]} (${lengthStat.Value}m, ${value}${unit}, ${volumeStat.Value}mm³)`;
                    return (
                      <Col md={4} key={index}>
                        <div className="rounded bg-light p-3 d-block" style={{ border: "1px solid #dee2e6" }}>
                          <div className="fw-bold">Wire consumption</div>
                          <div>{wireText}</div>
                        </div>
                      </Col>
                    );
                  } else {
                    return (
                      <Col md={4} key={index}>
                        <div className="rounded bg-light p-3 d-block" style={{ border: "1px solid #dee2e6" }}>
                          <div className="fw-bold">{name}</div>
                          <div>{parseFloat(value).toFixed(2).toString().substring(0, value.indexOf(".") + 3)} {unit}</div>
                        </div>
                      </Col>
                    );
                  }
                }
              })}

            </Row>
            <Row>
            </Row>

            <Row className="mt-5 d-flex justify-content-end">

              <Col xs="auto" className="g-2"><Button variant="primary" onClick={showModal}>Change Status</Button></Col>
              <Col xs="auto" className="g-2"><a href={`http://weldcube.ky.local/TPSI/ProcessingSteps/Details/${weldDetailToShow.Id}`} target="_blank"><Button variant="primary">Weld <FontAwesomeIcon icon={faLink} /></Button></a></Col>
              {weldDetailToShow.PartSerialNumber !== '' && (<Col xs="auto" className="g-2"><a href={`http://weldcube.ky.local/Parts/Overall/PartReport?partSerialNumber=${weldDetailToShow.PartSerialNumber}&partArticleNumber=${weldDetailToShow.PartArticleNumber}`} target="_blank"><Button variant="primary">Part <FontAwesomeIcon icon={faLink} /></Button></a></Col>)}
            </Row>

          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  });

  return (
    <Container style={isOpen ? { width: "1000px", marginLeft: "270px" } : { width: "1000px" }} fluid className={classNames("content", { "is-open": isOpen })}>
      <NavBar toggle={toggle} name={'Dashboard'} />
      <Row>
        <Col sm={12} md={12} lg={4} onClick={() => { setFilter("all"); setPageNumber(1); }} className='zoom user-select-none'>
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="fs-1 ms-3" style={{ color: "#7e899b", scale: "1.4" }}>200</div>
                <div style={{ whiteSpace: "nowrap", overflow: "hidden" }} className="lh-sm ms-5 text-secondary">Total of recent<br />welds to show</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={12} md={6} lg={4} onClick={() => { setFilter("Ok"); setPageNumber(1) }} className='zoom user-select-none'>
          <Card className="mb-3">
            <Card.Body>
              <div style={{ whiteSpace: "nowrap", overflow: "hidden" }} className="d-flex align-items-center">
                <div className="fs-1 ms-3" style={{ color: "#7e899b", scale: "1.4" }}>{totalOk}</div>
                <div className="lh-sm ms-5 text-secondary">Welds passed<br />with status <strong>OK</strong></div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={12} md={6} lg={4} onClick={() => { setFilter("NotOk"); setPageNumber(1) }} className='zoom user-select-none'>
          <Card className="mb-3">
            <Card.Body>
              <div style={{ whiteSpace: "nowrap", overflow: "hidden" }} className="d-flex align-items-center">
                <div className="fs-1 ms-4" style={{ color: "#7e899b", scale: "1.4" }}>{totalNotOk}</div>
                <div className="lh-sm ms-5 text-secondary">Welds awaits for<br />action to procedure </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {loading ? <><p className="text-center fw-bold pulsate mt-5">Welding</p><span className="loader"></span></> : <>
        {filter === 'all' ? <h6 className="mt-3" style={{ color: "#7e899b" }}>Showing All Recent Welds</h6> : <h6 className="mt-3 text-secondary">Showing Welds Status "{filter}"</h6>}
        {rows}
        <Row className="justify-content-center mt-3 mb-5">
          <Col xs="auto">
            <Pagination currentPage={pageNumber} totalPages={totalPages} onPageChange={handlePageChange} />
          </Col>
        </Row></>}

      <Modal show={show} onHide={hideModal}>
        <Modal.Header closeButton>
          <Modal.Title className="text-secondary mb-2">{weldDetailToShow.PartArticleNumber === '' ? 'N/A' : weldDetailToShow.PartArticleNumber}<br /><small className="mt-1" style={{ position: "absolute", fontSize: "10px", fontWeight: "bold" }}>ID: {weldDetailToShow.Id} </small></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formExplantion">
              <h4 className="text-center fw-bold text-secondary">State will be changed</h4>
              <p className="text-center text-secondary">from <strong>{weldDetailToShow.State}</strong> to <strong>{weldDetailToShow.State === "Ok" ? "NotOkEdited" : weldDetailToShow.State === "NotOkEdited" ? "OkEdited" : weldDetailToShow.State === "OkEdited" ? "NotOkEdited" : "OkEdited"}</strong></p>
              <Form.Label className="text-secondary">By user</Form.Label>
              <Form.Control
                style={{ border: "1px solid #ddd" }}
                type="text"
                placeholder="admin"
                autoFocus
                disabled
              /><br />
              <Form.Label className="text-secondary">Explanation</Form.Label>
              <Form.Control
                style={{ border: "1px solid #ddd", height: "100px" }}
                type="text"
                as="textarea"
                rows="3"
                autoFocus
                value={explanation}
                onChange={handleExplanationChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}

export default Content;