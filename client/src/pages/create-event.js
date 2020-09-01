import React from 'react';
import Header from './../components/header.js'
import EventHookForm from '../components/event-hook-form.js';

export default function Create({fetchEvents, setUser}) {
    return (
        <div>
            <Header setUser = {setUser} title='Create Event' />
            <EventHookForm fetchEvents={fetchEvents}/>
        </div>
    );
}