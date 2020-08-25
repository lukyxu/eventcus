import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import {Container, Row, Col} from 'react-bootstrap'
import Header from '../components/header.js'
import { logout } from '../services/authService'
import AllocateTickets from '../services/allocate.js';
import TicketReservationInfo from './../services/ticketReservationInfo.js';
import ChangePaymentStatus from './../services/changePaymentStatus.js';
import Button from '@material-ui/core/Button';
import { ButtonBase } from '@material-ui/core';
import SearchBar from 'material-ui-search-bar';
import EventTable from '../components/event-table'
import { useHistory } from "react-router-dom";



export default function Dashboard({ setUser }) {
  const history = useHistory();
    const [searchValue, setSearchValue] = useState('');
    const pressAllocate = () => {
        const reqBody = {
            sheetId: '1-B59r_kFGsAebgBlmaW18i5SU9jsbVRNIx2PkbIr358'
        }
        const res = AllocateTickets(reqBody);
    }

    const pressTicketResInfo = () => {
        const reqBody = {
            sheetId: '1-B59r_kFGsAebgBlmaW18i5SU9jsbVRNIx2PkbIr358'
        }
        const res = TicketReservationInfo(reqBody);
    }

    const events = [
      {
        eventDate: new Date(2020, 9, 10),
        name: "Ten 10",
        tickets: {
          paid: 15,
          reserved: 14,
          unreserved: 40
        }
      },
      {
        eventDate: new Date(2020, 9, 17),
        name: "Fresher's Dinner",
        tickets: {
          paid: 0,
          reserved: 0,
          unreserved: 40
        }
      },
      {
        eventDate: new Date(2020, 9, 1),
        name: "Ice Breaker",
        tickets: {
          paid: 40,
          reserved: 0,
          unreserved: 0
        }
      },
    ]
    const pressChangePaymentStatus = () => {
        const reqBody = {
            sheetId: '1-B59r_kFGsAebgBlmaW18i5SU9jsbVRNIx2PkbIr358',
            timestamp: '25/08/2020 07:35:04',
            fullName: 'Alex Liu',
        }
        const res = ChangePaymentStatus(reqBody);
    }

    return (
      <div>
        <Header title='Dashboard' />
        <div className='mt-5 centralDashboardContainer'>
          <Container fluid style={{minHeight:"100vh"}}>
            <Row>
              <Col xs={12}>
                <Button onClick= {() => history.push("/create-event")} className='blueButton' style={{width: "100%"}}>
                  CREATE A NEW EVENT
                </Button>
              </Col>
            </Row>
            <Row style={{paddingTop:"10px"}}>
              <Col xs={5}><SearchBar
                value={searchValue}
                onChange={(newValue) => setSearchValue(newValue)}
                onRequestSearch={() => null}/>
              </Col>
              <Col xs={7}>
                <Row style={{alignItems: "center", height: "100%"}}>
                  <Col>
                  <span className = "circle" style={{backgroundColor:"#4ae575"}}> </span> Paid
                  </Col>
                  <Col>
                  <span className = "circle" style={{backgroundColor:"#ffb800"}}> </span><span> Not Paid </span>
                  </Col>
                  <Col>
                  <span className = "circle" style={{backgroundColor:"#de5959"}}> </span><span> Not Reserved </span>
                  </Col>
                  <Col>
                  <span className = "circle" style={{backgroundColor:"#363636"}}> </span><span> Total </span>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row style={{paddingTop:"10px"}}>
              <Col xs={12}>
                <EventTable title="Upcoming Events" events={events.filter(e => e.eventDate.getTime() > new Date().getTime())}></EventTable>
              </Col>
            </Row>
            <Row style={{paddingTop:"10px"}}>
              <Col xs={12}>
                <EventTable title="Past Events" events={events.filter(e => e.eventDate.getTime() <= new Date().getTime())}></EventTable>
              </Col>
            </Row>
            <Link to={'/create-event'} className="nav-link">Create Event</Link>
            <Link to={'/login'} onClick={() => { logout(() => { setUser(null) }) }} className="nav-link">Logout</Link>

            <Button className="blueButton" onClick={pressAllocate}> Allocate </Button>
            <br></br>
            <Button className="blueButton" onClick={pressTicketResInfo}> Ticket Reservation Info </Button>
            <br></br>
            <Button className="blueButton" onClick={pressChangePaymentStatus}> ChangePaymentStatus </Button>
          </Container>
        </div>
      </div>
    );
}