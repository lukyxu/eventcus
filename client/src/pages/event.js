import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap'
import Header from '../components/header.js'
import Button from '@material-ui/core/Button';
import SearchBar from 'material-ui-search-bar';
import ReservationTable from '../components/reservation-table-draggable.js'
import AllocateTickets from '../services/allocate.js';
import TicketReservationInfo from './../services/ticketReservationInfo.js';
import ChangePaymentStatus from './../services/changePaymentStatus.js';
import TicketAllocations from './../services/ticketAllocations.js';
import ColourBar from '../components/colour-bar';
import { useHistory } from "react-router-dom";

export default function Event({ event }) {
  const [searchValue, setSearchValue] = useState('');
  const history = useHistory();

  console.log(event)
  // const event = loc.state.event

  const title = "normal"
  const reservations = [
    {
      name: "alex",
      timestamp: "25/08/2020 07:35:04",
      paymentStatus: "paid",
    },
    {
      name: "ben",
      timestamp: "25/08/2020 08:35:04",
      paymentStatus: "",
    }
  ]

  const pressAllocate = () => {
    const reqBody = {
      sheetId: event.sheetId,
    }
    const res = AllocateTickets(reqBody);
    console.log(res)
  }

  const pressTicketResInfo = () => {
    const reqBody = {
      sheetId: event.sheetId,
    }
    const res = TicketReservationInfo(reqBody);
    console.log(res)
  }

  const pressTicketAllocations =  () => {
    const reqBody = {
      sheetId: event.sheetId,
    }
    const res =  TicketAllocations(reqBody);
    console.log(res)
    return res
  }


  const pressEmailingList = () => {
    history.push(`/event/${event._id}/email`)
  }


  const pressChangePaymentStatus = () => {
    const reqBody = {
      sheetId: event.sheetId,
      timestamp: '25/08/2020 07:35:04',
      fullName: 'Alex Liu',
    }
    const res = ChangePaymentStatus(reqBody);
    console.log(res)
  }

  const renderColourText = (paid, reserved, unreserved, quantity, dropdown, event) => {
    return <span className="eventTableColouredText">
    <span style={{color:"#4ae575"}}>{paid}</span>
    <span style={{color:"#363636"}}>{"/"}</span>
    <span style={{color:"#ffb800"}}>{reserved}</span>
    <span style={{color:"#363636"}}>{"/"}</span>
    <span style={{color:"#de5959"}}>{unreserved}</span>
    <span style={{color:"#363636"}}>{"/"}</span>
    <span style={{color:"#363636"}}>{quantity}</span>
    
  </span>
  }

  return (
    <div>
      <Header title={event.name} />
      <div className='centralDashboardContainer'>
        <Container fluid style={{ minHeight: "100vh" }}>

            {event.tickets.map(ticket => {
              return <Row key={ticket.type}>
                <Col xs={3} sm={3}>
                  <span>{ticket.type}</span>
                </Col>
                <Col xs={5} sm={6} style={{ paddingRight: "0px" }}>
                  <div className="colourBarPadding"><ColourBar data={[
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

          <Row style={{ paddingTop: "10px" }}>
            <Col xs={12} sm={5}><SearchBar
              value={searchValue}
              onChange={(newValue) => setSearchValue(newValue)}
              onRequestSearch={() => null} />
            </Col>
          </Row>
          <Row style={{ paddingTop: "10px" }}>
            <Col sm={12}>
              <ReservationTable event={event} />
            </Col>
          </Row>
          {/* <Row style={{ paddingTop: "10px" }}>
            <Col sm={12}>
              <ReservationTable title="normal waitlist" reservations={reservations} />
            </Col>
          </Row> */}
          <Button className="blueButton" onClick={pressAllocate}> Allocate </Button>
          <br></br>
          <Button className="blueButton" onClick={pressTicketResInfo}> Ticket Reservation Info </Button>
          <br></br>
          <Button className="blueButton" onClick={pressTicketAllocations}> Ticket Allocations </Button>
          <br></br>
          <Button className="blueButton" onClick={pressChangePaymentStatus}> Change Payment Status </Button>
          <br></br>
          <Button className="blueButton" onClick={pressEmailingList}> Emailing List</Button>
          <br></br>
        </Container>
      </div>
    </div>
  );
}