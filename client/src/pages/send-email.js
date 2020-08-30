import React from 'react';
import Header from './../components/header.js'
import EmailForm from '../components/email-form.js';

export default function Send() {
  return (
    <div>
      <Header title='Create Event' />
      <EmailForm event={{
        name: "Chess",
        eventDate: "2020-08-27T18:40:00.000Z",
        tickets: [{
          paid: 2,
          quantity: 23,
          reserved: 2,
          type: "normal",
          unreserved: 19
        }],
        sheetId: "16rjpk9A0Si_ZcK8SIiomkNXzKoMa8xptwMYcXf5KhIE"
      }} />
    </div>
  );
}