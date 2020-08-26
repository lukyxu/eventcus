import React, {useState} from 'react';
import {Container, Row, Col} from 'react-bootstrap'
import Header from '../components/header.js'
import { logout } from '../services/authService'
import AllocateTickets from '../services/allocate.js';
import TicketReservationInfo from './../services/ticketReservationInfo.js';
import ChangePaymentStatus from './../services/changePaymentStatus.js';
import Button from '@material-ui/core/Button';
import SearchBar from 'material-ui-search-bar';
import EventTable from '../components/event-table'
import { useHistory } from "react-router-dom";

export default function Dashboard({ setUser, events}) {
  const history = useHistory();
    const [searchValue, setSearchValue] = useState('');

    // let resEvent = await fetch("http://localhost:9000/events")
    console.log(events)

 
    // events = [
    //   {
    //     eventDate: new Date(2020, 9, 10),
    //     name: "Ten 10",
    //     total: {
    //       type: total,
    //       paid: 15,
    //       reserved: 14,
    //       unreserved: 40,
    //       quantity: 69,
    //     },
    //     tickets: [
    //         {
    //             type: normal,
    //             paid: 5,
    //             reserved: 4,
    //             unreserved: 6,
    //             quantity: 15,
    //         },
    //         {
    //             type: vip,
    //             paid: 5,
    //             reserved: 4,
    //             unreserved: 6,
    //             quantity: 15,
    //         }
    //     ]
    //   },

    //   {
    //     eventDate: new Date(2020, 9, 17),
    //     name: "Fresher's Dinner",
    //     tickets: {
    //       paid: 0,
    //       reserved: 0,
    //       unreserved: 40
    //     }
    //   },
    //   {
    //     eventDate: new Date(2020, 9, 1),
    //     name: "Ice Breaker",
    //     tickets: {
    //       paid: 40,
    //       reserved: 0,
    //       unreserved: 0
    //     }
    //   },
    // ]

    const filteredEvents = () => {
      console.log(events)

      let e = events.sort((e1, e2) => new Date(e2.eventDate).getTime() - new Date(e1.eventDate).getTime()) //.filter(e => e.name.toUpperCase().startsWith(searchValue.toUpperCase()))
        console.log(e)
        return events
    }

    const pressAllocate = () => {
      const reqBody = {
          sheetId: '1-B59r_kFGsAebgBlmaW18i5SU9jsbVRNIx2PkbIr358'
      }
      const res = AllocateTickets(reqBody);
      console.log(res)
  }

    const pressTicketResInfo = () => {
      const reqBody = {
          sheetId: '1-B59r_kFGsAebgBlmaW18i5SU9jsbVRNIx2PkbIr358'
      }
      const res = TicketReservationInfo(reqBody);
      console.log(res)
    }

    const pressChangePaymentStatus = () => {
        const reqBody = {
            sheetId: '1-B59r_kFGsAebgBlmaW18i5SU9jsbVRNIx2PkbIr358',
            timestamp: '25/08/2020 07:35:04',
            fullName: 'Alex Liu',
        }
        const res = ChangePaymentStatus(reqBody);
        console.log(res)
    }

    return (
      <div>
        <Header title='Dashboard' />
        <div className='centralDashboardContainer'>
          <Container fluid style={{minHeight:"100vh"}}>
            <Row>
              <Col xs sm={12}>
                <Button onClick= {() => history.push("/create-event")} className='blueButton' style={{width: "100%"}}>
                  CREATE A NEW EVENT
                </Button>
              </Col>
            </Row>
            <Row style={{paddingTop:"10px"}}>
              <Col xs={12} sm={5}><SearchBar
                value={searchValue}
                onChange={(newValue) => setSearchValue(newValue)}
                onRequestSearch={() => null}/>
              </Col>
              <Col xs={12} sm={7}>
                <Row className="colouredKeys">
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
              <Col sm={12}>
                <EventTable title="Upcoming Events" events={filteredEvents()}></EventTable> 
                {/* .filter(e => new Date(e.eventDate).getTime() > new Date().getTime())}> */}
              </Col>
            </Row>
            <Row style={{paddingTop:"10px"}}>
              <Col sm={12}>
                <EventTable title="Past Events" events={filteredEvents()}></EventTable>
                    {/* // .filter(e => new Date(e.eventDate).getTime() <= new Date().getTime())} */}
              </Col>
            </Row>
            <br></br>
            <Button className="blueButton" onClick={pressAllocate}> Allocate </Button>
            <br></br>
            <Button className="blueButton" onClick={pressTicketResInfo}> Ticket Reservation Info </Button>
            <br></br>
            <Button className="blueButton" onClick={pressChangePaymentStatus}> Change Payment Status </Button>
            <br></br>
            <Button className="blueButton" onClick={() => { logout(() => { setUser(null); history.push('/login') })}}> Logout </Button>
            <br></br>
          </Container>
        </div>
      </div>
    );
}