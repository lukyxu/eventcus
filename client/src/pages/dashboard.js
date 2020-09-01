import React, {useState} from 'react';
import {Container, Row, Col} from 'react-bootstrap'
import Header from '../components/header.js'
import { logout } from '../services/authService'
import Button from '@material-ui/core/Button';
import SearchBar from 'material-ui-search-bar';
import EventTable from '../components/event-table'
import { useHistory } from "react-router-dom";

export default function Dashboard({ setUser, events, fetchEvents, renderEvents}) {
  const history = useHistory();
    const [searchValue, setSearchValue] = useState('');

    // let resEvent = await fetch("http://localhost:9000/events")
    console.log(events)

    const filteredEvents = events.filter(e => e.name.toUpperCase().startsWith(searchValue.toUpperCase()))

    

    return (
      <div>
        <Header title='Dashboard' setUser={setUser} />
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
                onRequestSearch={() => null}
                onCancelSearch={(() => setSearchValue(''))}/>
              </Col>
              <Col xs={12} sm={7}>
                <Row className="colouredKeys" style={{textAlign:"center"}}>
                  <Col>
                  <span className = "circle" style={{backgroundColor:"#4ae575"}}> </span> <span> Paid</span>
                  </Col>
                  <Col>
                  <span className = "circle" style={{backgroundColor:"#ffb800"}}> </span><span> Not Paid</span>
                  </Col>
                  <Col>
                  <span className = "circle" style={{backgroundColor:"#de5959"}}> </span><span> Not Reserved</span>
                  </Col>
                  <Col>
                  <span className = "circle" style={{backgroundColor:"#363636"}}> </span><span> Total</span>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row style={{paddingTop:"10px"}}>
              <Col sm={12}>
                <EventTable title="Upcoming Events" refreshButton={true} fetchEvents={fetchEvents} renderEvents={renderEvents} events={filteredEvents.filter(e => new Date(e.eventDate).getTime() > new Date().getTime())}></EventTable> 
              </Col>
            </Row>
            <Row style={{paddingTop:"10px"}}>
              <Col sm={12}>
                <EventTable title="Past Events" renderEvents={renderEvents} events={filteredEvents.filter(e => new Date(e.eventDate).getTime() <= new Date().getTime())}></EventTable>
              </Col>
            </Row>
            <br></br>
            <Button className="blueButton" onClick={() => { logout(() => { setUser(null); history.push('/login') })}}> Logout </Button>
            <br></br>
          </Container>
        </div>
      </div>
    );
}