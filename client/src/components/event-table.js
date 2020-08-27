import React, {useState} from 'react';
import { Col, Row } from 'react-bootstrap';
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

const dateFormat = 'DD/MM/YYYY'
export default function EventTable({title, events, refreshButton, fetchEvents, renderEvents}) {
  console.log(events)
  const [refreshing, setRefreshing] = useState(false)
  const refresh = async () => {
    setRefreshing(true)
    await fetchEvents()
    setRefreshing(false)
  }

  const render = () => {
    
    const renderTicketsReserved = (event) => {
      console.log(event)
      if (new Date(event.dropTime).getTime() < new Date().getTime()) {
        return <span className="eventTableColouredText">
          <span style={{color:"#4ae575"}}>{event.total.paid}</span>
          <span style={{color:"#363636"}}>{"/"}</span>
          <span style={{color:"#ffb800"}}>{event.total.reserved}</span>
          <span style={{color:"#363636"}}>{"/"}</span>
          <span style={{color:"#de5959"}}>{event.total.unreserved}</span>
          <span style={{color:"#363636"}}>{"/"}</span>
          <span style={{color:"#363636"}}>{event.total.quantity}</span>
          <img src="/dropdown.svg" alt="dropdown" onClick={() => {event.dashboardDrop = !event.dashboardDrop; renderEvents()}} className={event.dashboardDrop ? "dropdownUp":"dropdownDown"}></img>
        </span>
      }
    return <span className="eventTableColouredText">
      <span>Drop in {dayjs().from(event.dropTime, true)}</span>
      <img src="/dropdown.svg" alt="dropdown" onClick={() => {event.dashboardDrop = !event.dashboardDrop; renderEvents()}} className={event.dashboardDrop ? "dropdownUp":"dropdownDown"}></img>
    </span>
    }

    return events.map(event =>
      <div key={event.name}>
        <hr style={{"marginTop":"0px", "marginBottom":"0px"}}></hr>
        <Row>
          <Col xs={3} sm={3}>
          <span>{dayjs(event.eventDate).format(dateFormat)}</span>
          </Col>
          <Col xs={4} sm={4}>
            <span>{event.name}</span>
          </Col>
          <Col xs={5} sm={5}>
            {
              renderTicketsReserved(event)
            }
          </Col>
        </Row>
      </div>
    )
  }
    
  
  return <div className="eventTable">
    <Row>
      <Col sm={12}>
        {/* <Button className="blueButton">{title}</Button> */}
        <div className="eventTableHeader">{title}
          {refreshButton && !refreshing ? <div className="refreshButton" onClick={refresh}></div> : null}
          {refreshing ? <span style={{padding: "0px", display: "inline", fontSize: "10px", marginLeft:"5px", verticalAlign: "middle"}}> Refreshing...</span> : null}
        </div>
      </Col>
    </Row>
    <div style={{backgroundColor: "#f0f0f0", color:"#504e4e", width: "100%"}}>
      <Row>
        <Col xs={3} sm={3}>
          <b>{"Date"}</b>
        </Col>
        <Col xs={4} sm={4}>
          <b>{"Name"}</b>
        </Col>
        <Col xs={5} sm={5}>
          <b style={{textAlign:"end"}}>{"Tickets Reserved"}</b>
        </Col>
      </Row>
      {render()}
      
    </div>
  </div>
}