import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './../components/header.js'
import { Form, Col, Row } from 'react-bootstrap';


export default function Create() {

    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [details, setDetails] = useState('');
    const [release, setRelease] = useState('');

    const handleSubmit = (event) => { };

    return (
        <div>
            <Header title='Create Event' />
            <Link to={'/'} className="nav-link"> Dashboard </Link>
            
        </div>
    );
}