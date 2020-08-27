import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap'
import Header from '../components/header.js'
import AllocateTickets from '../services/allocate.js';
import TicketReservationInfo from '../services/ticketReservationInfo.js';
import ChangePaymentStatus from '../services/changePaymentStatus.js';
import Button from '@material-ui/core/Button';
import SearchBar from 'material-ui-search-bar';
import ReservationTable from '../components/reservation-table.js'
import { useHistory } from "react-router-dom";

export default function Dashboard() {

  const [searchValue, setSearchValue] = useState('');
  const sheetId = '1'

  const title = "normal"
  const reservations = [
    { name : "alex",
      timestamp : "25/08/2020 07:35:04",
      paymentStatus : "paid",
    },
    { name : "ben",
      timestamp : "25/08/2020 08:35:04",
      paymentStatus : "",
    }
  ]

  const pressAllocate = () => {
    const reqBody = {
      sheetId: sheetId
    }
    const res = AllocateTickets(reqBody);
    console.log(res)
  }

  const pressTicketResInfo = () => {
    const reqBody = {
      sheetId: sheetId
    }
    const res = TicketReservationInfo(reqBody);
    console.log(res)
  }

  const pressChangePaymentStatus = () => {
    const reqBody = {
      sheetId: sheetId,
      timestamp: '25/08/2020 07:35:04',
      fullName: 'Alex Liu',
    }
    const res = ChangePaymentStatus(reqBody);
    console.log(res)
  }

  return (
    <div>
      <Header title={"Ten10"} />
      <div className='centralDashboardContainer'>
        <Container fluid style={{ minHeight: "100vh" }}>

          <Row style={{ paddingTop: "10px" }}>
            <Col xs={12} sm={5}><SearchBar
              value={searchValue}
              onChange={(newValue) => setSearchValue(newValue)}
              onRequestSearch={() => null} />
            </Col>
          </Row>
          <Row style={{ paddingTop: "10px" }}>
            <Col sm={12}>
              <ReservationTable title = "normal" reservations = {reservations}/>
            </Col>
          </Row>
          <Row style={{ paddingTop: "10px" }}>
            <Col sm={12}>
              <ReservationTable title = "normal waitlist" reservations = {reservations}/>
            </Col>
          </Row>
          {/* <br></br>
          <Button className="blueButton" onClick={pressAllocate}> Allocate </Button>
          <br></br>
          <Button className="blueButton" onClick={pressTicketResInfo}> Ticket Reservation Info </Button>
          <br></br>
          <Button className="blueButton" onClick={pressChangePaymentStatus}> Change Payment Status </Button>
          <br></br>
          <Button className="blueButton" onClick={() => { logout(() => { setUser(null); history.push('/login') }) }}> Logout </Button>
          <br></br> */}
        </Container>
      </div>
    </div>
  );
}