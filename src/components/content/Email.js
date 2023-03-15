import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, ListGroup, Alert, Modal } from 'react-bootstrap';
import data from './emails.json';
import NavBar from './Navbar';
import classNames from "classnames";

function Email({ toggle, isOpen }) {

  const [emails, setEmails] = useState(data.emails);
  const [newEmail, setNewEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [show, setShow] = useState(false);
  const hideModal = () => setShow(false);
  const showModal = () => setShow(true);

  const moduleUrl = new URL(import.meta.url);
  const emailsJsonUrl = new URL('./emails.json', moduleUrl);
  const relativePath = emailsJsonUrl.pathname;

  // useEffect(() => {
  //   const emailData = { emails };
  //   fetch('./emails.json', {
  //     method: 'PUT',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(emailData),
  //   })
  //     .then((response) => response.json())
  //     .catch((error) => console.log(error));
  // }, [emails]);

  useEffect(() => {
    const emailData = { emails: emails };
    fetch('./emails.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })
      .catch((error) => console.log(error));
  }, [emails]);
  

  const handleEmailChange = (e) => {
    setNewEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEmail) {
      setErrorMessage('Email cannot be empty');
      return;
    }
    if (emails.find((email) => email === newEmail)) {
      setErrorMessage('Email already exists');
      return;
    }
    setEmails([...emails, newEmail]);
    setNewEmail('');
  
    try {
      await fetch('/api/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newEmail }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (index) => {
    const updatedEmail = prompt('Enter updated email', emails[index]);
    if (updatedEmail && !emails.find((email) => email === updatedEmail)) {
      setEmails([...emails.slice(0, index), updatedEmail, ...emails.slice(index + 1)]);
      const emailData = { emails: [...emails.slice(0, index), updatedEmail, ...emails.slice(index + 1)] };
      fetch('./emails.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      })
        .then((response) => response.json())
        .catch((error) => console.log(error));
    } else {
      setErrorMessage('Invalid or duplicate email');
    }
  };

  const handleRemove = (index) => {
    setEmails([...emails.slice(0, index), ...emails.slice(index + 1)]);
    const emailData = { emails: [...emails.slice(0, index), ...emails.slice(index + 1)] };
    fetch('./emails.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })
      .then((response) => response.json())
      .catch((error) => console.log(error));
  };

  return (
    <Container style={{ width: "1000px" }} fluid className={classNames("mail", { "is-open": isOpen })}>
      <NavBar toggle={toggle} name={'Mail List'} />
      <Row>
        <Col>
          <Form onSubmit={handleSubmit} className='d-flex'>
          <Button variant="primary" type="submit" className='me-2' style={{width:"70px"}}>Add</Button>
              <Form.Control type="email" placeholder="Enter email" value={newEmail} onChange={handleEmailChange} />
          </Form>
          {/*<span>{errorMessage && <Alert variant="danger">{errorMessage}</Alert>}</span>*/}
          <ListGroup as='ol' variant='flush' className="mt-3">
            {emails.map((email, index) => (
              <ListGroup.Item key={index} as="li" className="d-flex justify-content-between align-items-center">
                <span className='text-secondary'>{email}</span>
                <span>
                  <Button variant="outline-primary" size="sm" className="mx-2" onClick={() => handleEdit(index)}>Edit</Button>
                  <Button size="sm" onClick={() => handleRemove(index)}>Remove</Button>
                </span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>

      <Modal show={show} onHide={hideModal}>
        <Modal.Header closeButton>
          <Modal.Title className="text-secondary">#Product</Modal.Title>
        </Modal.Header>
        <Modal.Body><Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Name</Form.Label>
              <Form.Control className="border-1" type="text" autoFocus/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>Example textarea</Form.Label>
              <Form.Control as="textarea" rows={3} />
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

export default Email;