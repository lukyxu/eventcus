import React from 'react';
import { Jumbotron, Button } from 'react-bootstrap';

export default function Welcome({isAuthenticated, authButtonMethod, user}) {
  return (
    <Jumbotron>
      <h1>Email dashboard</h1>
      <p className="lead">
        This sample app shows how to use the Microsoft Graph API to access Outlook and OneDrive data from React
      </p>
      {/* If authenticated, greet the user; not authenticated, present a sign in button */}
      {isAuthenticated ?
        (<div>
          <h4>Welcome {user.displayName}!</h4>
          <p>Use the navigation bar at the top of the page to get started.</p>
        </div>)
        : <Button variant="primary" onClick={authButtonMethod}>Click here to sign in</Button>
      }
    </Jumbotron>
  );
}