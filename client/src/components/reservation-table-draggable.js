import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TicketAllocations from './../services/ticketAllocations.js';

async function getTicketReservations(reqBody) {
  // try {
  //   const res =  await TicketAllocations(reqBody);
  //   return await res.json
  // } catch (error) {
  //   return ({
  //     error
  //   });
  // }

  const res = await TicketAllocations(reqBody);
  console.log(res)
  return res
}

// fake data generator
const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k + offset}-${new Date().getTime()}`,
    content: `item ${k + offset}`
  }));

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

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle
});
const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: 250
});

export default function ReservationTable({ event }) {
  const [state, setState] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);

  useEffect(() => {
    if (state.length == 0) {
      const fetchTicketReservations = async () => {
        const reqBody = {
          sheetId: event.sheetId
        };
        const tickets = await getTicketReservations(reqBody);

        setTicketTypes(tickets)
        // if (tickets.error) {
        //   alert(JSON.stringify(tickets.error));
        // }
        const reservations = []
        tickets.map((ticket) => {
          reservations.push(ticket.reservations)
        })
        setState(reservations);
        console.log("useeffect")
      };
      fetchTicketReservations();

    }

  }, [event]);

  console.log(state)



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
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];
      console.log(newState)

      setState(newState.filter(group => group.length));
    }
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
      <div style={{ display: "flex" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {state.map((el, ind) => (
            <Droppable key={ind} droppableId={`${ind}`}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                  {...provided.droppableProps}
                >
                  <div>{`${ticketTypes[ind].ticketType} ${ticketTypes[ind].reservationStatus}`}</div>
                  {console.log(ind)}
                  {console.log(ticketTypes[ind])}

                  {el.map((item, index) => (
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
                              justifyContent: "space-around"
                            }}
                          >
                            {item.name}
                            <button
                              type="button"
                              onClick={() => {
                                const newState = [...state];
                                newState[ind].splice(index, 1);
                                setState(
                                  newState.filter(group => group.length)
                                );
                              }}
                            >
                              delete
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
}

