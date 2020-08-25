import React from 'react';
import { Jumbotron, Button } from 'react-bootstrap';
import { sendNewEmail } from '../services/graphService';
import { config } from '../services/config';

export default function SendEmail({ user, getAccessToken }) {

  // const firstMailingList = ["app-test1@outlook.com"]

  const sendMail = async () => {
    var accessToken = await getAccessToken(config.scopes);
    const message = {
      "subject": "Test email",
        "body": {
        "contentType": "Text",
        "content": "TEST EMAIL TEXT"
      },
      "toRecipients": [
        {
          "emailAddress": {
            "address": "app-test1@outlook.com"
          }
        }
      ]
    }
    sendNewEmail(accessToken, message);
  }

  return (
    <Jumbotron>
      <h1>Send Email</h1>
      <h4>Welcome {user.displayName}!</h4>
      <p>Press the button to send an email</p>
      <Button onClick={() => sendMail()}>Send</Button>
    </Jumbotron>
  );
}