import React from 'react';
import Header from './../components/header.js'
import EmailForm from '../components/email-form.js';

export default function Send() {
  const sheetId = "1-B59r_kFGsAebgBlmaW18i5SU9jsbVRNIx2PkbIr358";
  return (
    <div>
      <Header title='Create Event' />
      <EmailForm event={{
        eventName: "Test Event",
        ticketTypes: [{
          type: "normal",
          price: 5,
          quantity: 0
        }, {
          type: "vip",
          price: 10,
          quantity: 0
        }]
      }} sheetId={sheetId} />
    </div>
  );
}