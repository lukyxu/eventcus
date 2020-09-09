import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import UpdatePaymentStatus from "../services/changePaymentStatus.js";
import UpdateReservationStatus from "../services/changeReservationStatus.js";
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import { Row, Col } from 'react-bootstrap'
import SearchBar from 'material-ui-search-bar';
import LoadingButton from "./loading-button.js";
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

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



export default function ReservationTable({ event, fetchTicketInfo, fetchTicketReservations, state, setState, ticketTypes, setTicketTypes, loading, setLoading, payments, setPayments, reservations, setReservations }) {
  const [searchValue, setSearchValue] = useState('');

  // const filteredPeople = events.filter(e => e.name.toUpperCase().startsWith(searchValue.toUpperCase()))

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
    width: '100%',
  });

  // const refresh = async () => {
  //   console.log("refresh")
  //   setRefreshing(true)
  //   await fetchTicketReservations()
  //   setRefreshing(false)
  // }

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
      await UpdateReservationStatus(reqBody);
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
      await UpdatePaymentStatus(reqBody);
    }

  }

  const renderMemberIcon = (item) => {
    if (item.memberStatus === "Member" || item.memberStatus === "Fresher" ) {
      return (<img src='./../../assets/member-icon.png' alt="member icon" style={{ width: '18px', height: '18px' }}/>)
    } else {
      return (<img src='./../../assets/non-member-icon.png' alt="non-member icon" style={{ width: '18px', height: '18px' }}/>)
    }
  }

  const renderEmailedIcon = (item) => {
    if (item.emailStatus === "Emailed") {
      return (<img src='./../../assets/emailed-icon.png' alt="emailed icon" style={{ width: '18px', height: '18px' }}/>)
    }
  }

  const renderPaidButton = (item) => {
    return (
      <BootstrapSwitchButton
        size='sm'
        onlabel="Paid"
        offlabel=" "
        onstyle="success"
        offstyle="outline-secondary"
        checked={item.paymentStatus === "paid"}
        onChange={() => {
          changePaymentStatus(item)
        }}
      />
    )
  }

  const save = async () => {
    try {
      await updatePayments();
      await updateReservations();
      setPayments({})
      setReservations({})
      // setState([])
      // setTicketTypes([])

      await fetchTicketReservations()
      await fetchTicketInfo()
      toast.success("Payment and reservation saved");
    } catch (err) {
      toast.error(`Error with saving payments/reservation: ${err}`)
    }
  }

  const refresh = async() => {
    if (Object.entries(payments).length > 0 || Object.entries(reservations).length > 0) {
      if (!window.confirm("Unsaved reservation/payment changes. Are you sure you want to refresh payments?")) {
        return
      }
    }
    try {
      await fetchTicketReservations()
      await fetchTicketInfo()
      setPayments({})
      setReservations({})
      toast.success("Updated ticket information")
    } catch(err) {
      toast.error(`Failed to update ticket information: ${err}`)
    }
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
          <Col xs={12} sm={6}><SearchBar
          style={{marginBottom:"10px"}}
            value={searchValue}
            onChange={(newValue) => setSearchValue(newValue)}
            onRequestSearch={() => null}
            onCancelSearch={(() => setSearchValue(''))} />
          </Col>
          <Col xs={6} sm={3}>
            <LoadingButton title="Save" loadingTitle="Saving" onClick={save} />
          </Col>
          <Col xs={6} sm={3}>
            <LoadingButton title="Refresh" loadingTitle="Refreshing" onClick={refresh} />
          </Col>


        </Row>
        {/* <div style={{ display: "flex" }}> */}
        <Row style={{ paddingTop: "10px" }}>
          <DragDropContext onDragEnd={onDragEnd}>
            {ticketTypes.map((el, ind) => (
              <Col key={ind} xs={12} sm={6} xl={4}>
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
                                  {/* <div
                                    style={{
                                      display: "flex",
                                    }}
                                  >
                                    <div style={{ alignSelf: "center", flex: 1 }}>
                                      {item.name}
                                      {renderIcons(item)}
                                    </div>
                                    <div>
                                      {renderPaidButton(item)}
                                    </div>


                                  </div> */}
                                  <Row style={{ alignItems: 'center', paddingLeft: '10px', paddingRight: '10px' }}>
                                    <Col xs={9} sm={10} xl={10} >
                                      <Row style={{ alignItems: 'center' }}>
                                        <Col xs={6}>
                                          <Row className='reservationTimestamp'>
                                            {dayjs(item.timestamp).format('DD/MM HH:mm')}
                                          </Row>
                                          <Row style={{ paddingTop: '5px' }}>
                                            {renderMemberIcon(item)}
                                            {renderEmailedIcon(item)}
                                          </Row>
                                        </Col>
                                        <Col xs={6}>
                                          <Row>
                                            {item.name}
                                          </Row>
                                        </Col>
                                      </Row>
                                    </Col>
                                    <Col xs={3} sm={2} xl={2} style={{padding: "0px"}}>
                                      {renderPaidButton(item)}
                                    </Col>


                                  </Row>
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

