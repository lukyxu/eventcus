import React from 'react';
import Header from './../components/header.js'
import EmailForm from '../components/email-form.js';

export default function Send({ event, setUser }) {
  return (
    <div>
      <Header title='Create Event' setUser = {setUser}/>
      <EmailForm event={event}/>
    </div>
  );
}