import React from 'react';
import Header from './../components/header.js'
import EventHookForm from '../components/event-hook-form.js';

export default function Create(props) {
  console.log(props)
  const {fetchEvents} = props
    return (
        <div>
            <Header title='Create Event' />
            <EventHookForm fetchEvents={fetchEvents}/>
        </div>
    );
}