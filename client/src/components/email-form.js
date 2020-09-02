import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from "react-hook-form";
import { Button, Spinner, Row, Container } from "react-bootstrap";
import { config } from "../services/config";
import { UserAgentApplication } from 'msal';
import { ErrorMessage } from "@hookform/error-message";
import { sendNewEmail } from '../services/graphService';
import { toast, ToastContainer, Slide } from 'react-toastify';
import getEmails from '../services/emailingList';
import ReactLoading from 'react-loading';

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
  const [emailLoaded, setEmailLoaded] = useState(false);
  const {name, eventDate, sheetId} = event

  useEffect(() => {
    const fetchEmails = async () => {
      const reqBody = {
        sheetId: sheetId
      };
      const tickets = await getEmails(reqBody);
      if (tickets.error) {
        toast.error(`Error with getting emails: ${tickets.error}`);
      } else {
        setTicketTypes(tickets);
        setEmailLoaded(true);
      }
    };
    fetchEmails();
  }, [event, sheetId]);

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
    try {
      if (!isAuthenticated) {
        await login();
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      var accessToken = await getAccessToken(config.scopes);
      await Promise.all(ticketTypes.map(async (ticket, index) => {
        const email = {
          "subject": data.subject,
          "body": {
            "contentType": "Text",
            "content": data[getFieldName("message", ticketTypes[index].ticketType, ticketTypes[index].reservationStatus)]
          },
          "bccRecipients": ticket.reservations.map(email => {
            return ({
              "emailAddress": {
                "address": email
              }
            })
          })
        };
        console.log(email);
        // let res = await sendNewEmail(accessToken, email);
        // console.log(res);
        toast.success(`Emails sent`)
      }));
    } catch(err) {
      toast.error(`Error in sending email: ${err}`)
    }
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

  if (!emailLoaded) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <ToastContainer
        limit={3}
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        transition={Slide}
      />
      <ReactLoading type={"spinningBubbles"} color={"#5e99f1"} />
    </div>
  }

  if (ticketTypes.length > 1) {
    return (
      <Container fluid className="emailFormMain">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Row className="formSection" style={{ marginBottom: "15px" }}>
            <h4>Email Subject</h4>
            <input
              className="fieldInput"
              name="subject"
              placeholder="Subject of email"
              defaultValue={`Ticket Information for ${name}`}
              ref={register({ required: true })}
            />
            {errors.subject && <p className="eventFormErrorMessage">This field is required</p>}
          </Row>

          {ticketTypes.map((ticket, index) => {
            return (
              <div key={index}>
                <Row className="formSection" style={{ marginBottom: "15px" }}>
                  <h4>Email Body ({getCapitalizedType(ticket.ticketType)} {getCapitalized(ticket.reservationStatus)})</h4>
                  <textarea
                    className="fieldInput"
                    name={getFieldName("message", ticketTypes[index].ticketType, ticketTypes[index].reservationStatus)}
                    placeholder={`Email content for ${ticketTypes[index].ticketType} ${ticketTypes[index].reservationStatus}`}
                    rows="8"
                    defaultValue={ticketTypes[index].reservationStatus === 'reserved' ?
                      `Hi,\nYou have secured a ${ticketTypes[index].ticketType} ticket for ${name} on ${new Date(eventDate).toLocaleString()}.\nPayment Details:\nXXXXX`
                      : `Hi,\nYou have been waitlisted for a ${ticketTypes[index].ticketType} ticket for ${name} on ${new Date(eventDate).toLocaleString()}`}
                    ref={register({ required: <p className="eventFormErrorMessage">This field is required</p> })}
                  />
                  <ErrorMessage errors={errors} name={getFieldName("message", ticketTypes[index].ticketType, ticketTypes[index].reservationStatus)} />
                </Row>
              </div>
            );
          })}
          <Row className="formSection">
            <hr></hr>
            {renderSendButton()}
          </Row>
        </form>
      </Container>
    );
  }
  return (
    <Container fluid className="emailFormMain">
      <h1>No ticket holder information</h1>
    </Container>
  );
}