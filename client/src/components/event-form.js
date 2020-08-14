import React, { useState } from 'react';
import { Form, Col, Row, Button } from 'react-bootstrap';
import PostForm from './../services/post-form.js';

export default function EventForm() {

    const [eventName, setName] = useState('');
    const [eventDate, setDate] = useState('');
    const [eventDetails, setDetails] = useState('');
    const [ticketRelease, setRelease] = useState('');
    const [paymentInfo, setPayment] = useState('');

    const [defaultFieldsChecked, setDefaults] = useState({
        fullName: true,
        shortcode: true,
        email: true,
        contactNumber: true,
        foodAllergies: true,
    });

    const defaultFields = ['Full Name', 'Shortcode', 'Email', 'Contact Number', 'Food Allergy'];

    const [ticketTypes, setTicketTypes] = useState([{ type: '', price: 0, quantity: 0 }]);

    const addTicketType = () => {
        var list = [...ticketTypes];
        list.push({ type: '', price: 0 });
        setTicketTypes(list);
    };

    const removeTicketType = (ticket) => {
        if (ticketTypes.length > 1) {
            const list = [...ticketTypes];
            list.splice(list.indexOf(ticket), 1);
            setTicketTypes(list);
        }

    };

    const validateForm = () => {
        return (
			eventName.length > 0 &&
			eventDate.length > 0 &&
			eventDetails.length > 0 &&
			ticketRelease.length > 0 &&
			paymentInfo.length > 0 &&
			ticketTypes[0]['type'].length > 0 &&
			ticketTypes[0]['quantity'] > 0
		);
    };

    const handleSubmit = (event) => {
        const reqBody = {
            eventName,
            eventDate,
            eventDetails,
            ticketRelease,
            paymentInfo,
            ticketTypes,
            defaultFields
        }
        console.log("here")
        PostForm(reqBody);
        event.preventDefault();
    };
    
    const renderTicketType = (ticket) => {
        // if (ticket.type === '') {
            return (
                <Form.Group controlId="ticket" as={Row}>
                    <Col>
                        <Form.Control placeholder="Ticket Type" onChange={(e) => {
                            ticket['type'] = (e.target.value)
                            setTicketTypes([...ticketTypes])
                            }} />
                    </Col>
                    <Col>
                        <Form.Control placeholder="Price" onChange={(e) => {ticket['price'] = (e.target.value) 
                            setTicketTypes([...ticketTypes])
                        }} />
                    </Col>
                    <Col>
                        <Form.Control placeholder="Quantity" onChange={(e) => {ticket['quantity'] = (e.target.value) 
                            setTicketTypes([...ticketTypes])
                        }} />
                    </Col>
                    <Button id="removeCourseBtn" onClick={() => removeTicketType(ticket)}>X</Button>
                </Form.Group>
            )
        // } else {
        //     return (
        //         <Form.Group controlId="ticketFilled" as={Row}>
        //             <Col>
        //                 <Form.Control value={ticket.type} onChange={(e) => ticket['type'] = (e.target.value)} />
        //             </Col>
        //             <Col>
        //                 <Form.Control value={ticket.price} onChange={(e) => ticket['price'] = (e.target.value)} />
        //             </Col>
        //             <Col>
        //                 <Form.Control value={ticket.quantity} onChange={(e) => ticket['quantity'] = (e.target.value)} />
        //             </Col>

        //             <Button id="removeCourseBtn" onClick={() => removeTicketType(ticket)}>X</Button>
        //         </Form.Group>
        //     )
        // }
    };

    return (
        <div className='eventFormMain'>
            <Form onSubmit={handleSubmit}>
                <h1>Event Information</h1>
                <div className='eventFormSection'>
                    <Row>
                        <Col>
                            <Form.Group controlId="eventName" as={Row}>
                                <Col>
                                    <Form.Label>Event Name</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control placeholder="Enter an event name" value={eventName} onChange={(e) => setName(e.target.value)} />
                                </Col>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="eventDate" as={Row}>
                                <Col>
                                    <Form.Label>Event Date</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control placeholder="Choose date and time" value={eventDate} type ='date' onChange={(e) => setDate(e.target.value)} />
                                </Col>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="eventDetails" as={Row}>
                                <Col>
                                    <Form.Label>Event Details</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control as="textarea" placeholder="Enter some eventDetails" value={eventDetails} rows='3' onChange={(e) => setDetails(e.target.value)} />
                                </Col>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="ticketRelease"as={Row}>
                                <Col>
                                    <Form.Label>Ticket Release</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control placeholder="Choose date and time" type ='date' value={ticketRelease} onChange={(e) => setRelease(e.target.value)} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Col>
                                    <Form.Label>Payment Info</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control placeholder="Payment information" value={paymentInfo} onChange={(e) => setPayment(e.target.value)} />
                                </Col>
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
                <br />
                <h1>Ticket Information</h1>

                <div className='eventFormSection'>
                    <Row>
                        <Form.Group>
                            <Form.Label>
                                Add ticket types
                            </Form.Label>
                            {ticketTypes.map((ticket, i) => (
                                renderTicketType(ticket)
                            ))}
                            <Button onClick={addTicketType} >Add another ticket</Button>
                        </Form.Group>
                    </Row>
                </div>

                <br />
                <h1>Sign Up Form</h1>

                <div className='eventFormSection'>
                    <Row>
                        <Form.Group>
                            <Form.Label>
                                Select default fields to add to sign up form
                            </Form.Label>
                            {defaultFields.map(t => (
                                <Form.Check key={t} checked={defaultFieldsChecked[t]} type="checkbox" label={t} id={"checkbox_" + t}
                                    onChange={() => {
                                        defaultFieldsChecked[t] = !defaultFieldsChecked[t]
                                        setDefaults({ ...defaultFieldsChecked })
                                    }} />
                            ))}
                        </Form.Group>
                    </Row>
                </div>
                <br />
                <Button type="submit" id="submitEditBtn" disabled={!validateForm()}>
                    Create
				</Button>
            </Form>
        </div>

    );
}