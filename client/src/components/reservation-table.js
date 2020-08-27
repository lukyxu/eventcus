import React from 'react';
import { Col, Row } from 'react-bootstrap';
import dayjs from 'dayjs'

const dateFormat = 'DD/MM/YYYY HH:mm:ss'
export default function ReservationTable({title, reservations}) {


  const render = () => {
    return reservations.map(reservation =>
      <Row key={reservation.name}>
        <Col xs={3} sm={3}>
        <span>{reservation.timestamp}</span>
        </Col>
        <Col xs={4} sm={4}>
          <span>{reservation.name}</span>
        </Col>
        <Col xs={5} sm={5}>
          <div style ={{backgroundColor : '#bf1650', alignItems: 'flex-start'}}>
            <div style = {{float : 'right'}}>
            <input
            className="checkboxInputPayment"
            type="checkbox"
            name="fieldsChecked"
            defaultChecked={reservation.paymentStatus === "paid"}
          />
            </div>
          
          </div>
        
           
        </Col>
      </Row>
    )
  }
    
  
  return <div className="eventTable">
    <Row>
      <Col sm={12}>
        {/* <Button className="blueButton">{title}</Button> */}
        <div className="eventTableHeader">{title}</div>
      </Col>
    </Row>
    <div style={{backgroundColor: "#f0f0f0", color:"#504e4e", width: "100%"}}>
      <Row>
        <Col xs={3} sm={3}>
          <b>{"Time"}</b>
        </Col>
        <Col xs={4} sm={4}>
          <b>{"Name"}</b>
        </Col>
        <Col xs={5} sm={5}>
          <b style={{textAlign:"end"}}>{"Payment Status"}</b>
          
        </Col>
      </Row>
      {render()}
      
    </div>
  </div>
}