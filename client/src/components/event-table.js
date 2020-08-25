import React, { useState } from 'react';
import { Form, Col, Row, Button } from 'react-bootstrap';

export default function EventTable({title}) {
  return <div>
    <Row>
      <Col xs={12}>
        <b style={{backgroundColor: "#1d7bff", color:"#ffffff", padding: "10px 20px", width: "100%", display: "inherit"}}>{title}</b>
      </Col>
    </Row>
    <Row>
      <Col xs={3}>
        <b style={{backgroundColor: "#f0f0f0", color:"#504e4e", padding: "10px 20px", width: "100%", display: "inherit"}}>{"Date"}</b>
      </Col>
      <Col xs={5}>
        <b style={{backgroundColor: "#f0f0f0", color:"#504e4e", padding: "10px 20px", width: "100%", display: "inherit"}}>{"Name"}</b>
      </Col>
      <Col xs={4}>
        <b style={{backgroundColor: "#f0f0f0", color:"#504e4e", padding: "10px 20px", width: "100%", display: "inherit"}}>{"Tickets Reserved"}</b>
      </Col>
    </Row>
    {/* <Row style={{backgroundColor: "#f0f0f0", width:"100%", color:"#6766666", padding: "10px 20px"}}>
        {"Hello"}
     </Row> */}
  </div>
}