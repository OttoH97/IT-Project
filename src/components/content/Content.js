import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { Card, Col, Container, Row, Accordion, Button, Modal, Form, Table, Badge, DropdownButton, InputGroup } from "react-bootstrap";
import NavBar from "./Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { faCheck, faCross, faExclamation, faLink, faXmark } from "@fortawesome/free-solid-svg-icons";

import axios from 'axios';
import Pagination from "../pagination";
import ActualValuesComponent from "./actualvalues";

function Content({ toggle, isOpen }) {

  // Welds from weldcube API
  const [welds, setWelds] = useState([]);

  const [latestObjectId, setLatestObjectId] = useState('');

  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [filter, setFilter] = useState('all'); // <-- add filter state

  const [totalCount, setTotaCount] = useState(0);
  const [totalOk, setTotalOk] = useState(0);
  const [totalNotOk, setTotalNotOk] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [partToShow, setPartToShow] = useState([]);
  const [weldID, setWeldID] = useState('')
  const [weldDetailToShow, setWeldDetailToShow] = useState([])

  // Actualvalues
  const [actualValues, setActualValues] = useState([])
  const [qMasterValues, setQMasterValues] = useState([])
  const [violations, setViolations] = useState([]);
  const [sectionDetails, setSectionDetails] = useState([]);
  const [counterMap, setCounterMap] = useState({});

  const [currentMax, setCurrentMax] = useState(0);
  const [currentMin, setCurrentMin] = useState(0);

  const [activeKey, setActiveKey] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [id, setId] = useState('');

  let currentSectionIndex = 0;
let currentSectionColor = "blue"; // or any other initial color you want
let lastActualValueIndex = 0;


  // Modal
  const [show, setShow] = useState(false);
  const hideModal = () => setShow(false);
  const showModal = () => setShow(true);

  const handleClick = (id) => {
    const element = document.getElementById(id);
    element.scrollIntoView({ behavior: "smooth" });
  };

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  

  // Haetaan yleiset statiikat
  useEffect(() => {
    axios.get(`http://localhost:4000/welds?pageSize=1`)
      .then(response => {
        setTotalOk(response.data.totalCount);
        setTotalNotOk(response.data.totalNotOk);
        setTotalOk(response.data.totalOk);

      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  // Haetaan kaikki weldit
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
        setActualValues(response.data.ActualValues)
        setSectionDetails(response.data.SectionDetails)
      })
      .catch(error => {
        console.log(error);
      });
  };

  const incrementCounter = (timeStamp) => {
    setCounterMap(prevCounterMap => {
      const newCounterMap = { ...prevCounterMap };
      newCounterMap[timeStamp] = (newCounterMap[timeStamp] || 0) + 1;
      return newCounterMap;
    });
  }


  // Pagination
  function handlePageChange(page) {
    setPageNumber(page);
  }

  const startIndex = pageNumber * pageSize;
  const endIndex = startIndex + pageSize;
  const currentItems = welds.slice(startIndex, endIndex);

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

  const handleExplanationChange = (event) => {
    setExplanation(event.target.value);
  };

  const handleSubmit = () => {
    const user = 'admin';
    axios.post(`http://localhost:4000/api/v4/Welds/${weldID}/ChangeState?explanation=${explanation}&user=${user}`)
    hideModal();
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

  const errors = weldDetailToShow.Errors?.length ? (
    weldDetailToShow.Errors.map((error, index) => (
      <tr key={index}>
        <td>{error.ErrorCode}</td>
        <td>{error.ErrorCodeName}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="2">No errors found</td>
    </tr>
  );

  const limitViolations = welds.details?.WeldData?.LimitViolations?.map((violation, index) => (
    <tr key={index}>
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



  let rows = welds.map((weld, index) => {
    return (
      <Accordion id={index} className="mt-3" onClick={() => { handleClick(index);setWeldID(weld.Id); handleToggle(weld.Id); setWeldDetailToShow(weld) }} activeKey={activeKey} onSelect={handleAccordionClick}>
        <Accordion.Item eventKey={index} className="border-0 shadow-sm">
          <Accordion.Header>
            <Row className='align-items-center w-100'>
              <Col xs={'auto'} onClick={showModal} style={{ zIndex: "2" }}>
                <FontAwesomeIcon icon={weld.State === "NotOk" || weld.State === 'NotOkEdited' ? faExclamation : faCircleCheck} size="4x" style={{ color: weld.State === "NotOk" || weld.State === 'NotOkEdited' ? "#ff8a8a" : "#95d795" }} className={weld.State === "NotOk" || weld.State === 'NotOkEdited' ? "ms-4 me-4" : ""} />
              </Col>
              <Col xs={'auto'} className="text-secondary lh-sm">Name: #{weld.PartSerialNumber} {weld.PartArticleNumber}<br />Date: {formatTimestamp(weld.Timestamp)}<br />Status: {weld.State}</Col>
            </Row>
            <Col xs={'auto'}>
              {weld.Details?.LimitViolations?.length > 0 && (
                <span className="d-block p-1 rounded fw-bold text-white me-3" style={{ backgroundColor: "rgb(255, 138, 138)", fontSize: "12px" }}>
                  Violations: {weld.Details.LimitViolations.map((violation, index) => (
                    <span key={index}>{violation.ValueType} {violation.ViolationType === "Upper" ? "++" : (violation.ViolationType === "Lower" ? "--" : "")} </span>
                  ))}
                </span>
              )}
            </Col>
            {weld.Errors?.map((error, index) => (
              <span>{error.ErrorCode}: {error.ErrorCodeName}</span>
            ))}
          </Accordion.Header>
          <Accordion.Body style={{ backgroundColor: "white" }} className='text-secondary'>
            <Row className='gy-3'>
              <Col md={4}><div className="rounded bg-light p-3 d-block" style={{ border: "1px solid #dee2e6" }}>
                <div>Start Time</div>
                <div>{weldDetailToShow?.Timestamp ? formatTimestamp(weldDetailToShow.Timestamp) : 'Not found'}</div>
              </div>
              </Col>

              <Col md={4}><div className="rounded bg-light p-3 d-block" style={{ border: "1px solid #dee2e6" }}>
                <div>Duration</div>
                <div>{weldDetailToShow?.Duration ? (weldDetailToShow.Duration).toFixed(1) + ' s' : 'Not found'}</div>
              </div>
              </Col>

              {/* <Col md={4}><div className="rounded bg-light p-3 d-block" style={{ border: "1px solid #dee2e6" }}>
                <div>Part Item Number</div>
                <div>{weldDetailToShow?.PartArticleNumber ? weldDetailToShow.PartArticleNumber : 'Not found'}</div>
              </div>
              </Col> */}

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
                          <div>Wire consumption</div>
                          <div>{wireText}</div>
                        </div>
                      </Col>
                    );
                  } else {
                    return (
                      <Col md={4} key={index}>
                        <div className="rounded bg-light p-3 d-block" style={{ border: "1px solid #dee2e6" }}>
                          <div>{name}</div>
                          <div>{value} {unit}</div>
                        </div>
                      </Col>
                    );
                  }
                }
              })}
<div>
  <h1>Actual Values</h1>
  <button onClick={() => handleToggle(weldID)}>Fetch Actual Values</button>
  {weldID}
  <table>
    <thead>
      <tr>
        <th>Timestamp</th>
        <th>Unit</th>
        <th>MAX</th>
        <th>MIN</th>
        <th>Max</th>
        <th>Min</th>
      </tr>
    </thead>
    <tbody>
  {sectionDetails.map((section, sectionIndex) => {
    const { SingleValueStats } = section;
    const sectionEndTime = SingleValueStats[5].Value;
    let colorChanged = false;

    return section.ActualValues.map((actualValue, actualValueIndex) => {
      const { TimeStamp, Values } = actualValue;
      const qMasterLimitValue = section.QMaster?.QMasterLimitValuesList[0];

      if (qMasterLimitValue) {
        const max = qMasterLimitValue.CommandValue + qMasterLimitValue.UpperLimitValue;
        const min = qMasterLimitValue.CommandValue - qMasterLimitValue.UpperLimitValue;
        const value = Values[0]; // Get the first object from Values array

        const isMaxViolation = value.Max > max;
        const isMinViolation = value.Min < min;

        // Check if current actual value is within the current section
        if (TimeStamp <= sectionEndTime) {
          if (!colorChanged) {
            // Set color for this section
            colorChanged = true;
            return (
              <tr style={{ color: isMaxViolation || isMinViolation ? "red" : "black" }} key={`${TimeStamp}_${actualValueIndex}`}>
                <td>{actualValue.TimeStamp}</td>
                <td>{qMasterLimitValue.ViolationType}</td>
                <td>{max}</td>
                <td>{min}</td>
                <td>{value.Max}</td>
                <td>{value.Min}</td>
              </tr>
            );
          } else {
            // Return row without setting color (since color was already set for this section)
            return (
              <tr key={`${TimeStamp}_${actualValueIndex}`}>
                <td>{actualValue.TimeStamp}</td>
                <td>{qMasterLimitValue.ViolationType}</td>
                <td>{max}</td>
                <td>{min}</td>
                <td>{value.Max}</td>
                <td>{value.Min}</td>
              </tr>
            );
          }
        } else {
          // Move to next section since current actual value is outside current section
          return null;
        }
      } else {
        return <span>No data</span>;
      }
    });
  })}
</tbody>
  </table>
</div>

            </Row>
            <Row>
            </Row>
            <Row>
              <div>
                {/* <table>
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
                </table> */}
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
                </table>

              

                {/* <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>TimeStamp</th>
                      <th>I</th>
                      <th>U</th>
                      <th>Wfs</th>
                      <th>Power</th>
                      <th>Welding speed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actualValues.slice(0, 5).map((value) => (
                      <tr key={value.TimeStamp}>
                        <td>{value.TimeStamp}</td>
                        {value.Values.map((val) => (
                          <td key={val.Name}>{val.Mean}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table> */}

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
            <Row className="mt-5 d-flex justify-content-end">

              <Col xs="auto"><Button variant="primary" onClick={showModal}>Change Status</Button></Col>
              <Col xs="auto"><a href={`http://weldcube.ky.local/TPSI/ProcessingSteps/Details/${weldDetailToShow.Id}`} target="_blank"><Button variant="primary"><FontAwesomeIcon icon={faLink} /></Button></a></Col>
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
        <Col md={12} lg={4} onClick={() => { setFilter("all"); setPageNumber(1); }} className='zoom user-select-none'>
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="fs-1 ms-3" style={{ color: "#7e899b", scale: "1.4" }}>200</div>
                <div className="lh-sm ms-5 text-secondary">Total of recent welds to show</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={12} md={12} lg={4} onClick={() => { setFilter("Ok"); setPageNumber(1) }} className='zoom user-select-none'>
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="fs-1 ms-3" style={{ color: "#7e899b", scale: "1.4" }}>{totalOk}</div>
                <div className="lh-sm ms-5 text-secondary">Welds passed with status <strong>OK</strong></div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} lg={4} onClick={() => { setFilter("NotOk"); setPageNumber(1) }} className='zoom user-select-none'>
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="fs-1 ms-4" style={{ color: "#7e899b", scale: "1.4" }}>{totalNotOk}</div>
                <div className="lh-sm ms-5 text-secondary">Welds awaits for action to procedure </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {loading ? <span className="loader"></span> : <>
        {filter === 'all' ? <h6 className="mt-3 text-secondary">Showing All Recent Welds</h6> : <h6 className="mt-3 text-secondary">Showing Welds Status "{filter}"</h6>}
        {rows}
      <Row className="justify-content-center mt-3">
        <Col xs="auto">
          <Pagination currentPage={pageNumber} totalPages={totalPages} onPageChange={handlePageChange} />
        </Col>
      </Row></>}

      <Modal show={show} onHide={hideModal}>
        <Modal.Header closeButton>
          <Modal.Title className="text-secondary">#Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formExplantion">
              <h4 className="text-center fw-bold text-secondary">State will be changed</h4>
              <p className="text-center">State will be changed from <strong>{weldDetailToShow.State}</strong> to <strong>{weldDetailToShow.State === "Ok" ? "NotOkEdited" : weldDetailToShow.State === "NotOkEdited" ? "OkEdited" : weldDetailToShow.State === "OkEdited" ? "NotOkEdited" : "OkEdited"}</strong></p>
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
                style={{ border: "1px solid #ddd" }}
                type="text"
                autoFocus
                value={explanation}
                onChange={handleExplanationChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideModal}>
            Close
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