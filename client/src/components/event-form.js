import React, { useState } from 'react';
import { Form, Col, Row, Container, FormCheck, Button } from 'react-bootstrap';

export default function EventForm() {

    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [details, setDetails] = useState('');
    const [release, setRelease] = useState('');
    const [payment, setPayment] = useState('');

    const [defaultFieldsChecked, setDefaults] = useState({
        'Full Name': true,
        'Shortcode': true,
        'Email': true,
        'Contact Number': true,
        'Food Allergy': false,
    });

    const defaultFields = ['Full Name', 'Shortcode', 'Email', 'Contact Number', 'Food Allergy'];

    const [ticketTypes, setTicketTypes] = useState([{ type: '', price: 0 }]);

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

    const renderTicketType = (ticket) => {
        if (ticket.type === '') {
            return (
                <Form.Group as={Row}>
                    <Col>
                        <Form.Control placeholder="Ticket Type" onChange={(e) => ticket['type'] = (e.target.value)} />
                    </Col>
                    <Col>
                        <Form.Control placeholder="Price" onChange={(e) => ticket['price'] = (e.target.value)} />
                    </Col>

                    <Button id="removeCourseBtn" onClick={() => removeTicketType(ticket)}>X</Button>
                </Form.Group>
            )
        } else {
            return (
                <Form.Group as={Row}>
                    <Col>
                        <Form.Control placeholder={ticket.type} value={ticket.type} onChange={(e) => ticket['type'] = (e.target.value)} />
                    </Col>
                    <Col>
                        <Form.Control placeholder="Price" value={ticket.price} onChange={(e) => ticket['price'] = (e.target.value)} />
                    </Col>

                    <Button id="removeCourseBtn" onClick={() => removeTicketType(ticket)}>X</Button>
                </Form.Group>
            )
        }
    };

    const handleSubmit = (event) => { };

    return (
        <div className='eventFormMain'>
            <Form on submit={handleSubmit}>
                <h1>Event Information</h1>
                <div className='eventFormSection'>
                    <Row>
                        <Col>
                            <Form.Group as={Row}>
                                <Col>
                                    <Form.Label>Event Name</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control placeholder="Enter an event name" value={name} onChange={(e) => setName(e.target.value)} />
                                </Col>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group as={Row}>
                                <Col>
                                    <Form.Label>Event Date</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control placeholder="Choose date and time" value={name} onChange={(e) => setDate(e.target.value)} />
                                </Col>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group as={Row}>
                                <Col>
                                    <Form.Label>Event Details</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control as="textarea" placeholder="Enter some details" value={name} rows='3' onChange={(e) => setDetails(e.target.value)} />
                                </Col>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group as={Row}>
                                <Col>
                                    <Form.Label>Ticket Release</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control placeholder="Choose date and time" value={name} onChange={(e) => setRelease(e.target.value)} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Col>
                                    <Form.Label>Payment Info</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control placeholder="Payment information" value={name} onChange={(e) => setPayment(e.target.value)} />
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
            </Form>
        </div>

    );
}