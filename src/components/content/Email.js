import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, ListGroup, Alert } from 'react-bootstrap';
import data from './emails.json';
import NavBar from './Navbar';
import classNames from "classnames";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function Email({ toggle, isOpen }) {
  const [emails, setEmails] = useState(data.emails);
  const [newEmail, setNewEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const emailData = { emails };
    fetch('emails.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })
      .then((response) => response.json())
      .catch((error) => console.log(error));
  }, [emails]);

  const handleEmailChange = (e) => {
    setNewEmail(e.target.value);
  };

  const handleSubmit = (e) => {
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
    const emailData = { emails: [...emails, newEmail] };
    fetch('emails.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })
      .then((response) => response.json())
      .catch((error) => console.log(error));
  };

  const handleEdit = (index) => {
    const updatedEmail = prompt('Enter updated email', emails[index]);
    if (updatedEmail && !emails.find((email) => email === updatedEmail)) {
      setEmails([...emails.slice(0, index), updatedEmail, ...emails.slice(index + 1)]);
      const emailData = { emails: [...emails.slice(0, index), updatedEmail, ...emails.slice(index + 1)] };
      fetch('emails.json', {
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
    fetch('emails.json', {
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
    <Container style={{ width: "1000px" }} fluid className={classNames("content", { "is-open": isOpen })}>
      <NavBar toggle={toggle} name={'Mail List'} />
      <Row>
        <Col>
          <Form onSubmit={handleSubmit} className='d-flex'>
          <Button variant="primary" type="submit" className='me-2' style={{width:"70px"}}>Add</Button>
              <Form.Control type="email" placeholder="Enter email" value={newEmail} onChange={handleEmailChange} />
          </Form>
          <span>{errorMessage && <Alert variant="danger">{errorMessage}</Alert>}</span>
          <ListGroup as='ol' variant='flush' className="mt-3">
            {emails.map((email, index) => (
              <ListGroup.Item key={index} as="li" className="d-flex justify-content-between align-items-center">
                <span>{email}</span>
                <span>
                  <Button variant="outline-primary" size="sm" className="mx-2" onClick={() => handleEdit(index)}>Edit</Button>
                  <Button size="sm" onClick={() => handleRemove(index)}>Remove</Button>
                </span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
}

export default Email;