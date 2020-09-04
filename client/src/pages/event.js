import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap'
import Header from '../components/header.js'
import Button from '@material-ui/core/Button';
import ReservationTable from '../components/reservation-table-draggable.js'
import AllocateTickets from '../services/allocate.js';
import TicketReservationInfo from './../services/ticketReservationInfo.js';
import ColourBar from '../components/colour-bar';
import { useHistory } from "react-router-dom";
import dayjs from 'dayjs'
import nl2br from 'react-nl2br';

export default function Event({ event, setUser }) {
  const history = useHistory();

  let tickets = [...event.tickets]
  tickets.push(event.total)

  const [ticketInfo, setTicketInfo] = useState(tickets)

  console.log(event)

  const pressAllocate = () => {
    const reqBody = {
      sheetId: event.sheetId,
    }
    const res = AllocateTickets(reqBody);
    console.log(res)
  }

  const fetchTicketReservationInfo = async () => {
    const reqBody = {
      sheetId: event.sheetId,
    }
    const res = await TicketReservationInfo(reqBody);
    setTicketInfo(res)
  }

  const pressEmailingList = () => {
    history.push(`/event/${event._id}/email`)
  }


  const renderColourText = (paid, reserved, unreserved, quantity, dropdown, event) => {
    return <span className="eventTableColouredText">
      <span style={{ color: "#4ae575" }}>{paid}</span>
      <span style={{ color: "#363636" }}>{"/"}</span>
      <span style={{ color: "#ffb800" }}>{reserved}</span>
      <span style={{ color: "#363636" }}>{"/"}</span>
      <span style={{ color: "#de5959" }}>{unreserved}</span>
      <span style={{ color: "#363636" }}>{"/"}</span>
      <span style={{ color: "#363636" }}>{quantity}</span>

    </span>
  }

  return (
    <div>
      <Header title={event.name} setUser={setUser} />
      <div className='centralDashboardContainer'>
        <Container fluid style={{ minHeight: "100vh" }}>

          <Row>
            <Col xs={3} sm={3} xl={9}>
              <div className='eventName'>{event.name}</div>
            </Col>
            <Col xs={3} sm={3} xl={1}>
              <Button className="blueButton" onClick={() => window.open(event.formResUrl, "_blank")}> Google Form </Button>
            </Col>
            <Col xs={3} sm={3} xl={1}>
              <Button className="blueButton" onClick={() => window.open(event.sheetUrl, "_blank")}> Google Sheet </Button>
            </Col>
            <Col xs={3} sm={3} xl={1}>
              <Button className="blueButton" onClick={() => window.open(event.formEditUrl, "_blank")}> Edit Form </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              {dayjs(event.eventDate).format('LLLL')}
            </Col>
          </Row>
          <br></br>
          {ticketInfo.map(ticket => {
            return <Row key={ticket.type}>
              <Col xs={3} sm={3}>
                <span>{ticket.type}</span>
              </Col>
              <Col xs={5} sm={6} style={{ paddingRight: "0px" }}>
                <div className="colourBarPadding" style={{ marginTop: "0px", marginBottom: "10px" }}><ColourBar data={[
                  { name: "Paid", colour: "#4ae575", value: ticket.paid },
                  { name: "Reserved", colour: "#ffb800", value: ticket.reserved },
                  { name: "Unreserved", colour: "#de5959", value: ticket.unreserved },
                ]}></ColourBar></div>
              </Col>
              <Col xs={4} sm={3}>
                {
                  renderColourText(ticket.paid, ticket.reserved, ticket.unreserved, ticket.quantity, false, event)
                }
              </Col>
            </Row>
          })}
          <hr></hr>
          <Row>
            <Col>
              <b>Event Details</b> <br />
              <div>{nl2br(event.description)}</div>
              <br /><br />
              <b>Event Date</b><br />
              {dayjs(event.eventDate).format('LLLL')} <br /><br />
              <b>Payment Info</b><br />
              {nl2br(event.paymentInfo)}<br />
            </Col>

            <Col style={{ marginBottom: "10px" }} xs={12} sm={4}>
              <Button className="blueButton" onClick={() => window.open(event.formResUrl, "_blank")}> Google Form </Button>
              <br></br>
              {/* </Col>
            <Col style={{marginBottom: "10px"}} xs={12} sm={4}> */}
              <Button className="blueButton" onClick={() => window.open(event.sheetUrl, "_blank")}> Google Sheet </Button>
              {/* </Col>
            <Col style={{marginBottom: "10px"}} xs={12} sm={4}> */}
              <br></br>
              <Button className="blueButton" onClick={() => window.open(event.formEditUrl, "_blank")}> Edit Form </Button>
            </Col>
          </Row>
          <hr></hr>
          <Row>
            <Col style={{ marginBottom: "10px" }} xs={12} sm={6}>
              <Button className="blueButton" onClick={pressAllocate}> Allocate </Button>
            </Col>
            <Col style={{ marginBottom: "10px" }} xs={12} sm={6}>
              <Button className="blueButton" onClick={pressEmailingList}> Email </Button>
            </Col>
          </Row>

          <br></br>
          <Row style={{ paddingTop: "10px" }}>
            <Col sm={12}>
              <ReservationTable event={event} fetchTicketInfo={fetchTicketReservationInfo} />
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}