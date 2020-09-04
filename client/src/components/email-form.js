import React, { useState } from 'react';
import { Button, Spinner, Row } from "react-bootstrap";
import {toast} from 'react-toastify'
export default function EmailForm({ ticket, updateTickets, sendEmail, sendAll }) {

  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingSendAll, setLoadingSendAll] = useState(false);

  const renderSendButton = () => {
    if (loadingSend) {
      return <Button className="blueButton" type="button" disabled>
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
          style={{ marginRight: "5px", marginBottom: "2px" }}
        />
         Sending...
      </Button>
    } else {
      return (
      <Button className="blueButton"
        onClick={async () => {
          setLoadingSend(true);
          await sendEmail(ticket);
          setLoadingSend(false);
      }}>
        Send
      </Button>);
    }
  }

  const renderGetEmailButton = () => {
      return (
      <Button className="blueButton"
        onClick={async () => {
          try{
            await navigator.clipboard.writeText(ticket.reservations.join())
            toast.success(`Emails copied to clipboard`)
          } catch(err) {
            toast.error(`Failed to copy emails to clipboard: ${err}`)
          }
          
      }}>
        Copy Emails To Clipboard
      </Button>);
    }

  const renderSendAllButton = () => {
    if (loadingSendAll) {
      return <Button className="blueButton" type="button" disabled>
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
          style={{ marginRight: "5px", marginBottom: "2px" }}
        />
         Sending All...
      </Button>
    } else {
      return (
      <Button className="blueButton"
        onClick={async () => {
          setLoadingSendAll(true);
          console.log("22")
          await sendAll(ticket);
          console.log("23")
          setLoadingSendAll(false);
        }}>
          Send All
      </Button>);
    }
  }

  return (
    <div>
      <form>
        <Row className="formSection" style={{ marginBottom: "15px" }}>
          <h4>Email Subject</h4>
          <input
            className="fieldInput"
            placeholder="Subject of email"
            value={ticket.subject}
            onChange={(e) => {
              ticket.subject = e.target.value;
              updateTickets();
            }}
          />
        </Row>
        <Row className="formSection" style={{ marginBottom: "15px" }}>
          <h4>Email Body</h4>
          <textarea
            className="fieldInput"
            placeholder={`Email content for ${ticket.name}`}
            rows="8"
            value={ticket.message}
            onChange={(e) => {
              ticket.message = e.target.value;
              updateTickets();
            }}
          />
        </Row>
        <hr></hr>
        <Row className="formSection">
          {renderSendButton()}
        </Row>
        <hr></hr>
        <Row className="formSection">
          {renderSendAllButton()}
        </Row>
        <hr></hr>
        <Row className="formSection">
          {renderGetEmailButton()}
        </Row>
      </form>
    </div>
  );
}