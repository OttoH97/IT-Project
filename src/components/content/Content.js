import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { Card, Col, Container, Row, Accordion, Button, Modal, Form } from "react-bootstrap";
import NavBar from "./Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { faChevronLeft, faChevronRight, faExclamation } from "@fortawesome/free-solid-svg-icons";

import ReactPaginate from 'react-paginate';
import axios from 'axios';

function Content({ toggle, isOpen }) {


  // Welds from weldcube API
  const [welds, setWelds] = useState([]);
  const [latestWeld, setLatestWeld] = useState('');
  const [filterState, setFilterState] = useState("All");

  const [loading, setLoading] = useState(true);

  const [partToShow, setPartToShow] = useState([]);
  const [weldID, setWeldID] = useState('0eda2882-9ada-449d-8c7b-2a2d1aae0cf5')
  const [weldDetailToShow, setWeldDetailToShow] = useState([])

  // Actualvalues
  const [actualValues, setActualValues] = useState([])
  const [qMasterValues, setQMasterValues] = useState([])
  const [violations, setViolations] = useState([]);

  const [currentMax, setCurrentMax] = useState(0);
  const [currentMin, setCurrentMin] = useState(0);

  const [activeKey, setActiveKey] = useState(null);


  // Modal
  const [show, setShow] = useState(false);
  const hideModal = () => setShow(false);
  const showModal = () => setShow(true);


  // Haetaan kaikki weld data API:sta
  useEffect(() => {
    axios.get(`http://localhost:4000/welds`)
      .then(response => {
        setWelds(response.data.WeldInfos);
        setLatestWeld(response.data.WeldInfos[0].Id);
        setLoading(false);

      })
      .catch(error => {
        console.log(error);
        setLoading(false);

      });
  }, [latestWeld]);

  useEffect(() => {
    axios.get(`http://localhost:4000/welds/${weldID}`)
      .then(response => {
        setWeldDetailToShow(response.data);

      })
      .catch(error => {
        console.log(error);
      });
  }, [weldID]);

  // useEffect(() => {
  //   axios.get(`http://localhost:4000/api/v4/Welds/${weldID}/ActualValues`)
  //     .then(response => {
  //       setActualValues(response.data.ActualValues);

  //     })
  //     .catch(error => {
  //       console.log(error);
  //     });
  // }, [weldID]);

  // useEffect(() => {
  //   axios.get(`http://localhost:4000/api/v4/Welds/${weldID}/Sections/${1}`)
  //     .then(response => {
  //       setQMasterValues(response.data.QMaster.QMasterLimitValuesList);

  //     })
  //     .catch(error => {
  //       console.log(error);
  //     });
  // }, [weldID]);


    axios.get(`http://localhost:4000/api/v4/Welds/${weldID}/ActualValues`)
      .then(response => {
        const actualValuesData = response.data.ActualValues;

        axios.get(`http://localhost:4000/api/v4/Welds/${weldID}/Sections/${3}`)
          .then(response => {
            const qMasterValuesData = response.data.QMaster.QMasterLimitValuesList;
            
            const actualValuesWithQMaster = {
              Values: actualValuesData,
              QMasterLimitValuesList: qMasterValuesData
            }
            setActualValues(actualValuesWithQMaster);
            setCurrentMax(actualValuesWithQMaster.QMasterLimitValuesList[0].CommandValue+actualValuesWithQMaster.QMasterLimitValuesList[0].UpperLimitValue)
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        console.log(error);
  }, [weldID]);

  // Filters
  const handleFilter = (filter) => {
    setFilterState(filter);
  };

  const filteredWelds = welds.filter((weld) => {
    if (filterState === "All") {
      return true;
    } else if (filterState === "Ok") {
      return weld.State === "Ok";
    } else if (filterState === "Not Ok") {
      return weld.State === "NotOk";
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
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    return date.toLocaleString('en-US', options);
  }

  const handleAccordionClick = (eventKey) => {
    setActiveKey(eventKey === activeKey ? null : eventKey);
  };

  const stats = weldDetailToShow.WeldData?.Stats?.map((stat) => (
    <tr key={stat.Name}>
      <td>{stat.Name}</td>
      <td>{stat.Max}</td>
      <td>{stat.Mean}</td>
      <td>{stat.Min}</td>
      <td>{stat.Unit}</td>
    </tr>
  ));

  const errors = weldDetailToShow.Errors?.map((error, index) => (
    <tr key={index}>
      <td>{error.ErrorCode}</td>
      <td>{error.ErrorCodeName}</td>
    </tr>
  ));

  const limitViolations = weldDetailToShow.WeldData?.LimitViolations?.map((violation) => (
    <tr key={violation.ValueType}>
      <td>{violation.ValueType}</td>
      <td>{violation.ViolationType}</td>
    </tr>
  ));

  const singleStats = weldDetailToShow.WeldData?.SingleStats?.map((stat) => (
    <tr key={stat.Name}>
      <td>{stat.Name}</td>
      <td>{stat.Value}</td>
      <td>{stat.Unit}</td>
    </tr>
  ));

console.log(actualValues);

  let rows = currentItems.map((x,index) => {
    const { Id, Timestamp, ProcessingStepNumber, PartSerialNumber, MachineType, MachineSerialNumber, Details, State, Welder } = x;

    return (
      <Accordion className="mt-3" onClick={() => setWeldID(Id)} activeKey={activeKey} onSelect={handleAccordionClick}>
        <Accordion.Item eventKey={index} className="border-0 shadow-sm">
          <Accordion.Header>
            <Row className='align-items-center w-100'>
              <Col xs={'auto'}>
                <FontAwesomeIcon icon={State === "NotOk" ? faExclamation : faCircleCheck} size="4x" style={{ color: State === "NotOk" ? "#ff8a8a" : "#95d795" }} className={State === "NotOk" ? "ms-4 me-4" : ""} />
              </Col>
              <Col xs={'auto'} className="text-secondary lh-sm">Name: #{ProcessingStepNumber}<br />Date: {formatTimestamp(Timestamp)}<br />Status: {State}</Col>
            </Row>
          </Accordion.Header>
          <Accordion.Body style={{ backgroundColor: "white" }} className='text-secondary'>
            <Row>
              <div>
                {/*<table>
                  <thead>
                    <tr>
                      <th>Violation Type</th>
                      <th>Command Value</th>
                      <th>Lower Limit Value</th>
                      <th>Upper Limit Value</th>
                      <th>Deviation Time</th>
                      <th>Is Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qMasterValues.map((limitValue, index) => (
                      <tr key={index}>
                        <td>{limitValue.ViolationType}</td>
                        <td>{limitValue.CommandValue}</td>
                        <td>{limitValue.LowerLimitValue}</td>
                        <td>{limitValue.UpperLimitValue}</td>
                        <td>{limitValue.DeviationTime}</td>
                        <td>{limitValue.IsActive.toString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h1>Actual Values</h1>
                <ul>
                   {actualValues.slice(0, 5).map((values, index) => (
                    <li key={index}>
                      <p>TimeStamp: {values.TimeStamp}</p>
                      <ul>
                        {values.Values.slice(0, 1).map((value, index) => (
                          <li key={index}>
                            <p>Name: {value.Name}</p>
                            <p>Unit: {value.Unit}</p>
                            <p>Max: {value.Max}</p>
                            <p>Mean: {value.Mean}</p>
                            <p>Min: {value.Min}</p>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))} 
                </ul>

                <h2>Stats</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Max</th>
                      <th>Mean</th>
                      <th>Min</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>{stats}</tbody>
                </table>
                <h2>Errors</h2>
                <table>
                  <thead>
                    <tr>
                      <th>ErrorCode</th>
                    </tr>
                  </thead>
                  <tbody>{errors}</tbody>
                </table>
                <h2>Limit Violations</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Value Type</th>
                      <th>Violation Type</th>
                    </tr>
                  </thead>
                  <tbody>{limitViolations}</tbody>
                </table>
                <h2>Single Stats</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Value</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>{singleStats}</tbody>
                </table>*/}
                <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Current</th>
            <th>Voltage</th>
            <th>Wire Feed Speed</th>
            <th>Welding Duration</th>
            <th>Energy</th>
          </tr>
        </thead>
        <tbody>
          {actualValues.Values && actualValues.Values.map(value => (
            <tr key={value.TimeStamp}>
              <td>{value.TimeStamp}</td>
              <td style={value.Values[0].Max > currentMax ? { color: 'red' } : {}}>{value.Values[0].Max}</td>
              <td>{value.Values[1].Max}</td>
              <td>{value.Values[2].Max}</td>
              <td>{value.Values[3].Max}</td>
              <td>{value.Values[4].Max}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table>
        <thead>
          <tr>
            <th>Violation Type</th>
            <th>Command Value</th>
            <th>Lower Limit Value</th>
            <th>Upper Limit Value</th>
            <th>Violation Level</th>
          </tr>
        </thead>
        <tbody>
          {actualValues.QMasterLimitValuesList && actualValues.QMasterLimitValuesList.filter(item => item.ViolationType === 'Current').map(item => (
            <tr key={item.ViolationType}>
              <td>{item.ViolationType}</td>
              <td>{item.CommandValue}</td>
              <td>{item.LowerLimitValue}</td>
              <td>{item.UpperLimitValue}</td>
              <td>{item.ViolationLevel}</td>
            </tr>
          ))}
        </tbody>
        {currentMax} {currentMin}
        
      </table>
              </div>
            </Row>
            <Row className="mt-3 d-flex justify-content-between">
              <Col>Text</Col>
              <Col><Button variant="primary" onClick={showModal}>Change Status</Button></Col>
            </Row>

          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  });

  return (
    <Container style={{ width: "1000px" }} fluid className={classNames("content", { "is-open": isOpen })}>
      <NavBar toggle={toggle} name={'Dashboard'} />
      {loading ? <span className="loader"></span> : <>
        <Row>
          <Col md={12} lg={4} onClick={() => { handleFilter("All"); setCurrentPage(0); handlePageChange() }} className='zoom user-select-none'>
            <Card className="mb-3">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="fs-1 ms-3" style={{ color: "#7e899b", scale: "1.4" }}>{welds.length}</div>
                  <div className="lh-sm ms-5 text-secondary">Total of recent welds to show</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={12} md={12} lg={4} onClick={() => { handleFilter("Ok"); setCurrentPage(0) }} className='zoom user-select-none'>
            <Card className="mb-3">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="fs-1 ms-3" style={{ color: "#7e899b", scale: "1.4" }}>{welds.filter((weld) => weld.State === "Ok" || weld.State === "OkEdited").length}</div>
                  <div className="lh-sm ms-5 text-secondary">Welds passed with status <strong>OK</strong></div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={12} lg={4} onClick={() => { handleFilter("Not Ok"); setCurrentPage(0) }} className='zoom user-select-none'>
            <Card className="mb-3">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="fs-1 ms-4" style={{ color: "#7e899b", scale: "1.4" }}>{welds.filter((weld) => weld.State === "NotOk" || weld.State === "NotOkEdited").length}</div>
                  <div className="lh-sm ms-5 text-secondary">Welds awaits for action to procedure </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>{weldID}
        {filterState === 'All' ? <h6 className="mt-3 text-secondary">Showing All Recent Welds</h6> : <h6 className="mt-3 text-secondary">Showing Welds Status "{filterState}"</h6>}
        {rows}
        <Row className="justify-content-center mt-3">
          <Col xs="auto">
            <ReactPaginate
              previousLabel={<FontAwesomeIcon icon={faChevronLeft} />}
              nextLabel={<FontAwesomeIcon icon={faChevronRight} />}
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
      </>}
      <Modal show={show} onHide={hideModal}>
        <Modal.Header closeButton>
          <Modal.Title className="text-secondary">#Product</Modal.Title>
        </Modal.Header>
        <Modal.Body><Form>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label className="text-secondary">Are you sure you want to update #product state from OK to Not Ok?</Form.Label>
            <Form.Control style={{ border: "1px solid #ddd" }} type="text" placeholder="Name" autoFocus />
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