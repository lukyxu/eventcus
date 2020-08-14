import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './header.js'
import { Form, Col, Row } from 'react-bootstrap';
import EventForm from './../components/event-form';

export default function EventForm() {

    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [details, setDetails] = useState('');
    const [release, setRelease] = useState('');

    const handleSubmit = (event) => { };
    
    return (
        <Form on submit={handleSubmit}>
            <Form.Group as={Row}>
                <Form.Group as={Row}>
                    <Col>
                        <Form.Label>Event Name</Form.Label>
                    </Col>
                    <Col>
                        <Form.Control placeholder="Enter an event name" value={name} onChange={(e) => setName(e.target.value)} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Col>
                        <Form.Label>Event Date</Form.Label>
                    </Col>
                    <Col>
                        <Form.Control placeholder="Enter an event date" value={name} onChange={(e) => setDate(e.target.value)} />
                    </Col>
                </Form.Group>
            </Form.Group>
        </Form>
    );
}