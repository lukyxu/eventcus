import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap'
import Header from '../components/header.js'
import Button from '@material-ui/core/Button';
import ReservationTable from '../components/reservation-table-draggable.js'
import AllocateTickets from '../services/allocate.js';
import TicketReservationInfo from './../services/ticketReservationInfo.js';
import TicketAllocations from './../services/ticketAllocations.js';
import ColourBar from '../components/colour-bar';
import { useHistory } from "react-router-dom";
import dayjs from 'dayjs';
import nl2br from 'react-nl2br';
import { toast } from 'react-toastify';
import LoadingButton from '../components/loading-button.js';

async function getTicketReservations(reqBody) {
  const res = await TicketAllocations(reqBody);
  console.log(res)
  return res
}

export default function Event({ event, events, setUser, setEvents }) {
  const history = useHistory();

  const [state, setState] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState({});
  const [reservations, setReservations] = useState({});

  let tickets = [...event.tickets]
  tickets.push(event.total)

  const [ticketInfo, setTicketInfo] = useState(tickets)

  console.log(events)

  const fetchTicketReservations = async () => {
    const reqBody = {
      sheetId: event.sheetId
    };
    const tickets = await getTicketReservations(reqBody);
    console.log(tickets)

    // if (tickets.error) {
    //   alert(JSON.stringify(tickets.error));
    // }
    const reservations = []
    tickets.sort(function (a, b) {
      if (a.ticketType === b.ticketType) { return (a.reservationStatus < b.reservationStatus) ? -1 : 1 }
      if (a.ticketType < b.ticketType) { return -1 }
      return 1;
    })

    tickets.map((ticket, index) => {
      reservations.push(ticket.reservations.map(item => {
        item["src"] = index;
        return item
      }))
    })
    setState(reservations);
    setTicketTypes(tickets);
    setLoading(false);
  };

  useEffect(() => {
    fetchTicketReservations();
  }, []);

  const refresh = async() => {
    await fetchTicketReservationInfo()
    await fetchTicketReservations()
  }

  const pressAllocate = async () => {
    const reqBody = {
      sheetId: event.sheetId,
    }
    try {
      const res = await AllocateTickets(reqBody);
      console.log(res);
    } catch (err) {
      toast.error(`Error with allocating tickets: ${err}`);
      return
    }
    try {
      await refresh()
      toast.success(`Tickets allocated`);
    } catch(err) {
      toast.warn(`Tickets allocated but error with fetching ticket reservation status: ${err}`);
    }
  }

  const fetchTicketReservationInfo = async () => {
    const reqBody = {
      sheetId: event.sheetId,
    }
    var res = await TicketReservationInfo(reqBody);
    setTicketInfo(res)
    event.total = res.find(t => t.type === "Total")
    res = res.filter(t => t.type !== "Total")
    event.tickets = res
    events[events.findIndex(e => e === event)] = {...event}
    setEvents([...events])
    console.log("OK")
  }

  const pressEmailingList = () => {
    history.push(`/event/${event._id}/email`)
  }


  const renderColourText = (paid, reserved, unreserved, quantity, dropdown, event) => {
    return <span className="eventTableColouredText">
      <span style={{ color: "#4ae575" }}>{paid}</span>
      <span style={{ color: "#363636" }}>{"/"}</span>
      <span style={{ color: "#ffb800" }}>{reserved}</span>
      <span style={{ color: "#363636" }}>{"/"}</span>
      <span style={{ color: "#de5959" }}>{unreserved}</span>
      <span style={{ color: "#363636" }}>{"/"}</span>
      <span style={{ color: "#363636" }}>{quantity}</span>

    </span>
  }

  return (
    <div>
      <Header title={event.name} setUser={setUser} />
      <div className='centralDashboardContainer'>
        <Container fluid style={{ minHeight: "100vh" }}>

          <Row>
            <Col xs={12} sm={9} xl={9}>
              <div>
                <div className='eventName'>{event.name}</div>
                <div className='eventDate'>{dayjs(event.eventDate).format('LLLL')}</div>

              </div>
            </Col>
            <Col xs={12} sm={3} xl={3}>
              <Row>
                <Col xs={4} sm={4} xl={4}>
                  {/* <Button className="blueButton" onClick={() => window.open(event.formResUrl, "_blank")}> Google Form </Button> */}
                  <Button onClick={() => window.open(event.formResUrl, "_blank")}><img src='./../../assets/google-forms-icon.png' style={{width : '64px', height : '64px'}}></img></Button>
                </Col>
                <Col xs={4} sm={4} xl={4}>
                  {/* <Button className="blueButton" onClick={() => window.open(event.sheetUrl, "_blank")}> Google Sheet </Button> */}
                  <Button onClick={() => window.open(event.sheetUrl, "_blank")}><img src='./../../assets/google-sheets-icon.png' style={{width : '64px', height : '64px'}}></img></Button>
                </Col>
                <Col xs={4} sm={4} xl={4}>
                <Button onClick={() => window.open(event.formEditUrl, "_blank")}><img src='./../../assets/google-form-edit-icon.png' style={{ height : '72px'}}></img></Button>
                </Col>
              </Row>

            </Col>

          </Row>
          <br></br>

          <Row>
            <Col>
              <b>Event Details</b> <br />
              <div>{nl2br(event.description)}</div>
              <br></br>
              <b>Payment Information</b><br />
              {nl2br(event.paymentInfo)}<br />
            </Col>
          </Row>
          <hr></hr>
          <Row>
            <Col>
              <b>Ticket Information</b> <br />

            </Col>
          </Row>
          <br></br>
          {ticketInfo.map(ticket => {
            return <Row key={ticket.type}>
              <Col xs={3} sm={3}>
                <span>{ticket.type}</span>
              </Col>
              <Col xs={5} sm={6} style={{ paddingRight: "0px" }}>
                <div className="colourBarPadding" style={{ marginTop: "0px", marginBottom: "10px" }}><ColourBar data={[
                  { name: "Paid", colour: "#4ae575", value: ticket.paid },
                  { name: "Reserved", colour: "#ffb800", value: ticket.reserved },
                  { name: "Unreserved", colour: "#de5959", value: ticket.unreserved },
                ]}></ColourBar></div>
              </Col>
              <Col xs={4} sm={3}>
                {
                  renderColourText(ticket.paid, ticket.reserved, ticket.unreserved, ticket.quantity, false, event)
                }
              </Col>
            </Row>
          })}
          <hr></hr>
          <Row>
            <Col style={{ marginBottom: "10px" }} xs={12} sm={6}>
              <LoadingButton title="Allocate" loadingTitle="Allocating" onClick={pressAllocate} />
            </Col>
            <Col style={{ marginBottom: "10px" }} xs={12} sm={6}>
              <Button className="blueButton" onClick={pressEmailingList}> Email </Button>
            </Col>
          </Row>
          <hr></hr>
          <Row>
            <Col xs={12} sm={12} xl={12}>
              <ReservationTable event={event} fetchTicketInfo={fetchTicketReservationInfo} state={state} setState={setState} ticketTypes={ticketTypes} setTicketTypes={setTicketTypes} loading={loading} setLoading={setLoading} payments={payments} setPayments={setPayments} reservations={reservations} setReservations={setReservations} fetchTicketReservations={fetchTicketReservations}/>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}