import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TicketAllocations from './../services/ticketAllocations.js';
import UpdatePaymentStatus from "../services/changePaymentStatus.js";
import UpdateReservationStatus from "../services/changeReservationStatus.js";
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import { Button, Container, Row, Col } from 'react-bootstrap'
import SearchBar from 'material-ui-search-bar';
import LoadingButton from "./loading-button.js";
import { toast } from 'react-toastify';

async function getTicketReservations(reqBody) {
  const res = await TicketAllocations(reqBody);
  console.log(res)
  return res
}

// fake data generator
// const getItems = (count, offset = 0) =>
//   Array.from({ length: count }, (v, k) => k).map(k => ({
//     id: `item-${k + offset}-${new Date().getTime()}`,
//     content: `item ${k + offset}`
//   }));

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};
const grid = 8;




export default function ReservationTable({ event, fetchTicketInfo }) {
  const [state, setState] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reservations, setReservations] = useState({});
  const [searchValue, setSearchValue] = useState('');

  // const filteredPeople = events.filter(e => e.name.toUpperCase().startsWith(searchValue.toUpperCase()))

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

  }, [event]);

  const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? "#5E99F1" : "white",

    // styles we need to apply on draggables
    ...draggableStyle
  });

  const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? "#D4F9F9" : "#E8E8E8",
    padding: grid,
    // width: (ticketTypes.length >= 2) ? 1200 / ticketTypes.length : 500
    width : '100%',
  });

  const refresh = async () => {
    console.log("refresh")
    setRefreshing(true)
    await fetchTicketReservations()
    setRefreshing(false)
  }

  console.log(state)
  console.log(ticketTypes)

  const changePaymentStatus = (item) => {
    let key = item.timestamp + '#' + item.name
    const newPayments = { ...payments }
    if (newPayments[key] == null) {
      newPayments[key] = true;
    } else {
      delete newPayments[key];
    }

    item.paymentStatus = (item.paymentStatus === "paid") ? undefined : "paid"

    setPayments(newPayments);
  }

  const changeReservationStatus = (item, dst) => {
    let key = item.timestamp + '#' + item.name
    const newReservations = { ...reservations }

    delete newReservations[key]

    if (item.src !== dst) {
      item.dst = dst;
      newReservations[key] = item;
    }

    setReservations(newReservations);
  }

  const updateReservations = async () => {
    for (var key in reservations) {
      let strings = key.split('#');
      let ind = reservations[key].dst
      let newTicket = ticketTypes[ind]

      const reqBody = {
        sheetId: event.sheetId,
        timestamp: strings[0],
        fullName: strings[1],
        ticketType: newTicket.ticketType,
        reservationStatus: newTicket.reservationStatus,
      }
      const res = UpdateReservationStatus(reqBody);
    }

  }

  const updatePayments = async () => {
    for (var key in payments) {
      let strings = key.split('#');
      const reqBody = {
        sheetId: event.sheetId,
        timestamp: strings[0],
        fullName: strings[1],
      }
      const res = UpdatePaymentStatus(reqBody);
    }

  }

  const renderPaidButton = (item) => {
    return (
      <BootstrapSwitchButton
        onlabel="Paid"
        offlabel=" "
        onstyle="success"
        offstyle="outline-secondary"
        size="sm"
        checked={item.paymentStatus === "paid"}
        onChange={() => {
          changePaymentStatus(item)
        }}
      />
    )
  }

  const save = async () => {
    await updatePayments();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await updateReservations();
    await new Promise(resolve => setTimeout(resolve, 4000));

    await fetchTicketReservations()
    await fetchTicketInfo()
    setPayments({})
    setReservations({})
    toast.success("Payment and reservation saved");
  }

  function onDragEnd(result) {
    const { source, destination } = result;
    console.log(source)
    console.log(destination)

    // dropped outside the list
    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = reorder(state[sInd], source.index, destination.index);
      const newState = [...state];
      newState[sInd] = items;
      console.log(newState)
      setState(newState);
    } else {

      console.log(state[sInd][source.index])
      console.log(dInd)
      changeReservationStatus(state[sInd][source.index], dInd)

      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];
      console.log(newState)

      setState(newState);
    }
  }

  if (!loading) {
    if (ticketTypes.length === 0) {
      return <div> No Sign Ups</div>
    }
    return (
      <div>
        {/* <button
        type="button"
        onClick={() => {
          setState([...state, []]);
        }}
      >
        Add new group
      </button>
      <button
        type="button"
        onClick={() => {
          setState([...state, getItems(1)]);
        }}
      >
        Add new item
      </button> */}
        <Row style={{ paddingTop: "10px" }}>
          <Col xs={12} sm={5}><SearchBar
            value={searchValue}
            onChange={(newValue) => setSearchValue(newValue)}
            onRequestSearch={() => null} 
            onCancelSearch={(() => setSearchValue(''))}/>
          </Col>
          <Col>
            <LoadingButton style={{ width: "120px" }} title="Save" loadingTitle="Saving" onClick={save} />
          </Col>


        </Row>
        {/* <div style={{ display: "flex" }}> */}
        <Row style={{ paddingTop: "10px" }}>
          <DragDropContext onDragEnd={onDragEnd}>
            {ticketTypes.map((el, ind) => (
              <Col xs={12} sm={6} xl={6}>
                <Droppable key={ind} droppableId={`${ind}`}>
                  {(provided, snapshot) => (
                    // <div >
                      <div style={{ padding: '20px 15px 0' }}>
                        <Row>
                        <div className="reservationColumnHeader">{`${ticketTypes[ind].ticketType} ${ticketTypes[ind].reservationStatus}`}</div>

                        </Row>
                        <Row>
                          <div
                          ref={provided.innerRef}
                          style={getListStyle(snapshot.isDraggingOver)}
                          {...provided.droppableProps}
                        >
                          {/* <div>{`${ticketTypes[ind].ticketType} ${ticketTypes[ind].reservationStatus}`}</div> */}



                          {state[ind].filter(e => e.name.toUpperCase().startsWith(searchValue.toUpperCase())).map((item, index) => (
                            <Draggable
                              key={`item-${item.timestamp}-${item.name}`}
                              draggableId={`item-${item.timestamp}-${item.name}`}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                  )}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                    }}
                                  >
                                    <div style={{ alignSelf: "center", flex: 1 }}>
                                      {item.name}
                                    </div>
                                    <div>
                                      {renderPaidButton(item)}
                                    </div>


                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>

                        </Row>

                        
                        

                      </div>
                    // </div>


                  )}
                </Droppable>

              </Col>

            ))}
          </DragDropContext>

        </Row>

        {/* </div> */}
      </div>
    );
  }

  return (
    <div>
      Loading
    </div>
  );

}

