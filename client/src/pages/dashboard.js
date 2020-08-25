import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import {Container, Row, Col} from 'react-bootstrap'
import Header from '../components/header.js'
import { logout } from '../services/authService'
import AllocateTickets from '../services/allocate.js';
import TicketReservationInfo from './../services/ticketReservationInfo.js';
import Button from '@material-ui/core/Button';
import { ButtonBase } from '@material-ui/core';
import SearchBar from "material-ui-search-bar";
import EventTable from "../components/event-table"


export default function Dashboard({ setUser }) {
    const [searchValue, setSearchValue] = useState('');
    const pressAllocate = () => {
        const reqBody = {
            sheetId: '1rSQ4ZqxQz3qxyH9oUDJ2KYN4C2kCz2gQSZicq9ayO9E'
        }
        const res = AllocateTickets(reqBody);
    }

    const pressTicketResInfo = () => {
        const reqBody = {
            sheetId: '1rSQ4ZqxQz3qxyH9oUDJ2KYN4C2kCz2gQSZicq9ayO9E'
        }
        const res = TicketReservationInfo(reqBody);
    }

    return (
        <div>
            <Header title='Dashboard' />
            <div className='mt-5' style={{margin: "auto", maxWidth: "80vw", minWidth: "400px"}}>
              <Container fluid style={{minHeight:"100vh"}}>
                <Row>
                  <Col xs={12}><Button className='blueButton' style={{width: "100%"}}>CREATE A NEW EVENT</Button></Col>
                </Row>
                <Row style={{paddingTop:"10px"}}>
                  <Col xs={5}><SearchBar
                    value={searchValue}
                    onChange={(newValue) => setSearchValue(newValue)}
                    onRequestSearch={() => null}
                  /></Col>
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
                    <EventTable title="Upcoming Events"></EventTable>
                  </Col>
                </Row>
                <Row style={{paddingTop:"10px"}}>
                  <Col xs={12}>
                    <EventTable title="Past Events"></EventTable>
                  </Col>
                </Row>
                <Link to={'/create-event'} className="nav-link">Create Event</Link>
                <Link to={'/login'} onClick={() => { logout(() => { setUser(null) }) }} className="nav-link">Logout</Link>
                {/* <p className='createNewEventButton'>Create a new event</p> */}

                <Button className="blueButton" onClick={pressAllocate}> Allocate </Button>
                <Button className="blueButton" onClick={pressTicketResInfo}> Ticket Reservation Info </Button>
              </Container>
            </div>
        </div>
    );
}