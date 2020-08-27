import React from 'react';
import { Link } from 'react-router-dom';
import Header from './../components/header.js'
import EmailForm from '../components/email-form.js';

export default function Email() {
  return (
    <div>
      <Header title='Email' />
      {/* <Link to={'/'} className="nav-link"> Dashboard </Link> */}
      <EmailForm />
      {/* <EventHookForm fetchEvents={fetchEvents} /> */}

    </div>
  );
}