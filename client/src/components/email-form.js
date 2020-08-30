import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from "react-hook-form";
import { Button, Spinner, Row, Container } from "react-bootstrap";
import { config } from "../services/config";
import { UserAgentApplication } from 'msal';
import { ErrorMessage } from "@hookform/error-message";
import { sendNewEmail } from '../services/graphService';

async function getEmails(reqBody) {
  try {
    let res = await fetch('/getEmailsAndTicketTypes', {
      method: "post",
      body: JSON.stringify(reqBody),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include"
    })
    if (res.status === 401) {
      console.log(`ERROR ${res.status}`);
      return ({
        error: "User not authenticated"
      });
    }
    return await res.json();
  } catch (error) {
    return ({
      error
    });
  }
}

const getCapitalized = (str) => str.charAt(0).toUpperCase() + str.slice(1)

const getCapitalizedType = (ticketType) => {
  return getCapitalized(ticketType.replace(/ .*/, ''));
}

const getFieldName = (prefix, ticketType, reservationStatus) => {
  const status = reservationStatus.charAt(0).toUpperCase() + reservationStatus.slice(1);
  return prefix + getCapitalizedType(ticketType) + status;
}

export default function EmailForm({ event }) {

  const [loadingSend, setLoadingSend] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ticketTypes, setTicketTypes] = useState([]);
  const {name, eventDate, sheetId} = event

  const info = [{
    ticketType: "normal (£5)",
    reservationStatus: "reserved",
    emails: ["app-test1@outlook.com", "ben@gmail.com"]
  }, {
    ticketType: "vip (£10)",
    reservationStatus: "reserved",
    emails: ["app-test1@outlook.com", "ben@gmail.com"]
  }, {
    ticketType: "normal (£5)",
    reservationStatus: "waitlist",
    emails: ["app-test1@outlook.com", "ben@gmail.com"]
  }];

  useEffect(() => {
    const fetchEmails = async () => {
      const reqBody = {
        sheetId: sheetId
      };
      const tickets = await getEmails(reqBody);
      if (tickets.error) {
        alert(JSON.stringify(tickets.error));
      }
      setTicketTypes(tickets);
    };
    fetchEmails();
  }, [event]);


  var userAgentApplication = new UserAgentApplication({
    auth: {
      clientId: config.appId,
      redirectUri: config.redirectUri
    },
    cache: {
      cacheLocation: "sessionStorage",
      storeAuthStateInCookie: false
    }
  });

  const getAccessToken = useCallback(
    async (scopes) => {
      try {
        // Get the access token silently
        // If the cache contains a non-expired token, this function
        // will just return the cached token. Otherwise, it will
        // make a request to the Azure OAuth endpoint to get a token
        var silentResult = await userAgentApplication.acquireTokenSilent({
          scopes: scopes
        });

        return silentResult.accessToken;
      } catch (err) {
        // If a silent request fails, it may be because the user needs
        // to login or grant consent to one or more of the requested scopes
        if (isInteractionRequired(err)) {
          var interactiveResult = await userAgentApplication.acquireTokenPopup({
            scopes: scopes
          });

          return interactiveResult.accessToken;
        } else {
          throw err;
        }
      }
    },
    [userAgentApplication],
  )

  // If MSAL already has an account, the user is already logged in
  useEffect(() => {
    var account = userAgentApplication.getAccount();

    if (account) {
      setIsAuthenticated(true);
    }
  }, [userAgentApplication])

  async function login() {
    try {
      // Login via popup
      await userAgentApplication.loginPopup(
        {
          scopes: config.scopes,
          prompt: "select_account"
        });
      setIsAuthenticated(true);
    }
    catch (err) {
      setIsAuthenticated(false);
    }
  }

  function logout() {
    userAgentApplication.logout();
  }

  function isInteractionRequired(error) {
    if (!error.message || error.message.length <= 0) {
      return false;
    }

    return (
      error.message.indexOf('consent_required') > -1 ||
      error.message.indexOf('interaction_required') > -1 ||
      error.message.indexOf('login_required') > -1
    );
  }

  const { register, handleSubmit, errors } = useForm({
    criteriaMode: "all",
  });

  const onSubmit = async (data) => {
    setLoadingSend(true);
    if (!isAuthenticated) {
      await login();
    }
    var accessToken = await getAccessToken(config.scopes);
    info.map((ticket, index) => {
      const email = {
        "subject": `Ticket information for ${name}`,
        "body": {
          "contentType": "Text",
          "content": data[getFieldName("message", info[index].ticketType, info[index].reservationStatus)]
        },
        "bccRecipients": ticket.emails.map(email => {
          return ({
            "emailAddress": {
              "address": email
            }
          })
        })
      };
      try {
        // let res = await sendNewEmail(accessToken, email);
        // console.log(res);
      } catch (err) {
        alert(err)
      }
    });
    alert("Emails Sent");
    setLoadingSend(false);
  };

  const renderSendButton = () => {
    if (loadingSend) {
      return <Button className="blueButton" type="submit" disabled>
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
          style={{ marginRight: "5px", marginBottom: "2px" }}
        />
         Sending...
      </Button>
    } else {
      return <Button className="blueButton" type="submit">Send</Button>
    }
  }

  return (
    <Container fluid className="emailFormMain">
      {isAuthenticated ? (<Button onClick={() => logout()}>Sign Out</Button>) : null}
      <form onSubmit={handleSubmit(onSubmit)}>
        {info.map((ticket, index) => {
          // console.log(ticketTypes);
          return(
            <div key={index}>
              <Row className="formSection" style={{ marginBottom: "15px" }}>
                <h4>Email Body ({getCapitalizedType(ticket.ticketType)} {getCapitalized(ticket.reservationStatus)})</h4>
                <textarea
                  className="fieldInput"
                  name={getFieldName("message", info[index].ticketType, info[index].reservationStatus)}
                  placeholder={`Email content for ${info[index].ticketType} ${info[index].reservationStatus}`}
                  rows="8"
                  defaultValue={info[index].reservationStatus === 'reserved' ?
                    `Hi,\nYou have secured a ${info[index].ticketType} ticket for ${name} on ${new Date(eventDate).toLocaleString()}.\nPayment Details:\nXXXXX`
                    : `Hi,\nYou have been waitlisted for a ${info[index].ticketType} ticket for ${name} on ${new Date(eventDate).toLocaleString()}`}
                  ref={register({ required: <p className="eventFormErrorMessage">This field is required</p> })}
                />
                <ErrorMessage errors={errors} name={getFieldName("message", info[index].ticketType, info[index].reservationStatus)} />
              </Row>
            </div>
        );})}
        <Row className="formSection">
          <hr></hr>
          {renderSendButton()}
        </Row>
      </form>
    </Container>
  );
}