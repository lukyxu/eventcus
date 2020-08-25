import React from 'react';
import { Col, Row } from 'react-bootstrap';
import dayjs from 'dayjs'

const dateFormat = 'DD/MM/YYYY'
export default function EventTable({title, events}) {
  return <div className="eventTable">
    <Row>
      <Col xs={12}>
        {/* <Button className="blueButton">{title}</Button> */}
        <div className="eventTableHeader">{title}</div>
      </Col>
    </Row>
    <div style={{backgroundColor: "#f0f0f0", color:"#504e4e", width: "100%"}}>
      <Row>
        <Col xs={3}>
          <b>{"Date"}</b>
        </Col>
        <Col xs={4}>
          <b>{"Name"}</b>
        </Col>
        <Col xs={5}>
          <b>{"Tickets Reserved"}</b>
        </Col>
      </Row>
      {events.map(event => 
        <Row key={event.name}>
          <Col xs={3}>
          <span>{dayjs(event.eventDate).format(dateFormat)}</span>
          </Col>
          <Col xs={4}>
            <span>{event.name}</span>
          </Col>
          <Col xs={5}>
              <span className="eventTableColouredText">
                <span style={{color:"#4ae575"}}>{event.tickets.paid}</span>
                <span style={{color:"#363636"}}>{"/"}</span>
                <span style={{color:"#ffb800"}}>{event.tickets.reserved}</span>
                <span style={{color:"#363636"}}>{"/"}</span>
                <span style={{color:"#de5959"}}>{event.tickets.unreserved}</span>
                <span style={{color:"#363636"}}>{"/"}</span>
                <span style={{color:"#363636"}}>{event.tickets.paid + event.tickets.reserved + event.tickets.unreserved}</span>
              </span>
          </Col>
        </Row>
      )}
    </div>
  </div>
}