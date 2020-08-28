import React, {useState} from 'react';
import { Col, Row } from 'react-bootstrap';
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import ColourBar from '../components/colour-bar';
import { useHistory } from "react-router-dom";
dayjs.extend(relativeTime)

const dateFormat = 'DD/MM/YYYY'
export default function EventTable({title, events, refreshButton, fetchEvents, renderEvents}) {
  const [refreshing, setRefreshing] = useState(false)
  const history = useHistory()
  const refresh = async () => {
    setRefreshing(true)
    await fetchEvents()
    setRefreshing(false)
  }

  const render = () => {
    const renderColourText = (paid, reserved, unreserved, quantity, dropdown, event) => {
      return <span className="eventTableColouredText">
      <span style={{color:"#4ae575"}}>{paid}</span>
      <span style={{color:"#363636"}}>{"/"}</span>
      <span style={{color:"#ffb800"}}>{reserved}</span>
      <span style={{color:"#363636"}}>{"/"}</span>
      <span style={{color:"#de5959"}}>{unreserved}</span>
      <span style={{color:"#363636"}}>{"/"}</span>
      <span style={{color:"#363636"}}>{quantity}</span>
      {dropdown ? <img src="/dropdown.svg" alt="dropdown" onClick={() => {event.dashboardDrop = !event.dashboardDrop; renderEvents()}} className={event.dashboardDrop ? "dropdownUp":"dropdownDown"}></img> : null}
    </span>
    }
    
    const renderTicketsReserved = (event) => {
      if (new Date(event.dropTime).getTime() < new Date().getTime()) {
        return renderColourText(event.total.paid, event.total.reserved, event.total.unreserved, event.total.quantity, true, event)
      }
    return <span className="eventTableColouredText">
      <span>Drop in {dayjs().from(event.dropTime, true)}</span>
      <img src="/dropdown.svg" alt="dropdown" onClick={() => {event.dashboardDrop = !event.dashboardDrop; renderEvents()}} className={event.dashboardDrop ? "dropdownUp":"dropdownDown"}></img>
    </span>
    }

    const renderDropdown= (event) => {
      if (!event.dashboardDrop) {
        return null
      }
      return event.tickets.map(ticket => {
        return <Row key={ticket.type}>
          <Col xs={3} sm={3}>
            <span>{ticket.type}</span>
          </Col>
          <Col xs={5} sm={6} style={{paddingRight:"0px"}}>
            <div className="colourBarPadding"><ColourBar data={[
              {name: "Paid", colour: "#4ae575", value: ticket.paid},
              {name: "Reserved", colour: "#ffb800", value: ticket.reserved},
              {name: "Unreserved", colour: "#de5959", value: ticket.unreserved},
              ]}></ColourBar></div>
          </Col>
          <Col xs={4} sm={3}>
            {
              renderColourText(ticket.paid, ticket.reserved, ticket.unreserved, ticket.quantity, false, event)
            }
          </Col>
        </Row>
      })
    }

    return events.map(event =>
      <div key={event.name}>
        <hr style={{"marginTop":"0px", "marginBottom":"0px"}}></hr>
        <Row>
          <Col xs={3} sm={3}>
          <span>{dayjs(event.eventDate).format(dateFormat)}</span>
          </Col>
          <Col xs={4} sm={4}>
            <span style={{cursor: "pointer"}} onClick={() => history.push(`event/${event._id}`)}>{event.name}</span>
          </Col>
          <Col xs={5} sm={5}>
            {
              renderTicketsReserved(event)
            }
          </Col>
        </Row>
        {renderDropdown(event)}
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
    <div style={{backgroundColor: "#ffffff", color:"#504e4e", width: "100%"}}>
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