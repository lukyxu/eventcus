import React from 'react';
import { Button, Row } from "react-bootstrap";
import {toast} from 'react-toastify'
import LoadingButton from './loading-button';

export default function EmailForm({ ticket, updateTickets, sendEmail, sendAll }) {
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
          <LoadingButton title="Send" loadingTitle="Sending" onClick={async () => {await sendEmail(ticket);}}/>
        </Row>
        <hr></hr>
        <Row className="formSection">
          <LoadingButton title="Send All" loadingTitle="Sending All" onClick={async () => { await sendAll(); }} />
        </Row>
        <hr></hr>
        <Row className="formSection">
          {renderGetEmailButton()}
        </Row>
      </form>
    </div>
  );
}