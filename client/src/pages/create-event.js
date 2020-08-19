import React from 'react';
import { Link } from 'react-router-dom';
import Header from './../components/header.js'
import EventForm from './../components/event-form';

export default function Create() {
    return (
        <div>
            <Header title='Create Event' />
            <Link to={'/'} className="nav-link"> Dashboard </Link>
            <EventForm/>
        </div>
    );
}