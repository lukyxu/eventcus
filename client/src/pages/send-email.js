import React, { useEffect, useState, useCallback } from 'react';
import Header from './../components/header.js'
import EmailForm from '../components/email-form.js';
import ReactLoading from 'react-loading';
import dayjs from 'dayjs';
import getEmails from '../services/emailingList';
import { toast } from 'react-toastify';
import { config } from "../services/config";
import { UserAgentApplication } from 'msal';
import Select from 'react-select'
import { Container, Row } from "react-bootstrap";
import { sendNewEmail } from '../services/graphService';
import updateEmailStatus from '../services/updateEmailStatus.js';

const getCapitalized = (str) => str.charAt(0).toUpperCase() + str.slice(1)

const getCapitalizedType = (ticketType) => {
  return getCapitalized(ticketType.replace(/ .*/, ''));
}

export default function Send({ event, setUser }) {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [emailLoaded, setEmailLoaded] = useState(false);
  const [ticketIndex, setTicketIndex] = useState(0);
  const { name, eventDate, sheetId } = event

  const ticketOptions = ticketTypes.map((t, i) => ({value: i, label: t.name, reservationStatus: t.reservationStatus}))
  const reservedOptions = ticketOptions.filter(t => t.reservationStatus === "reserved")
  const waitlistOptions = ticketOptions.filter(t => t.reservationStatus === "waitlist")
  const groupedOptions = [{
    label: 'Reserved',
    options: reservedOptions
  }, {
    label: 'Waitlist',
    options: waitlistOptions
  }]

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

  const updateStatus = async (emails) => {
    emails.forEach(async (email) => {
      const reqBody = {
        sheetId: sheetId,
        email: email
      }
      let res = await updateEmailStatus(reqBody);
      console.log(res);
    });
  }

  const sendOne = async (ticket) => {
    try {
      if (!isAuthenticated) {
        await login();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      var accessToken = await getAccessToken(config.scopes);
      const recipients = ticket.emailEveryone ? ticket.reservations : ticket.unemailed;
      const email = {
        "subject": ticket.subject,
        "body": {
          "contentType": "Text",
          "content": ticket.message
        },
        "bccRecipients": recipients.map(email => {
          return ({
            "emailAddress": {
              "address": email
            }
          })
        })
      }
      console.log(email);
      if (recipients.length > 0) {
        // let res = await sendNewEmail(accessToken, email);
        // console.log(res);
        await updateStatus(recipients);
      }
      toast.success(`Email sent`)
    } catch (err) {
      toast.error(`Error in sending email: ${err}`)
    }
  }

  const sendAll = async () => {
    try {
      if (!isAuthenticated) {
        await login();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      for (let i = 0; i < ticketTypes.length; i++) {
        await (async (ticket) => {
          if (ticket.reservationStatus !== "reserved" && ticket.reservationStatus !== "waitlist") {
            return
          }
          var accessToken = await getAccessToken(config.scopes);
          const recipients = ticket.emailEveryone ? ticket.reservations : ticket.unemailed;
          const email = {
          "subject": ticket.subject,
          "body": {
            "contentType": "Text",
            "content": ticket.message
          },
          "bccRecipients": recipients.map(email => {
            return ({
              "emailAddress": {
                "address": email
                }
              })
            })
          }
          console.log(email);
          if (recipients.length > 0) {
            // let res = await sendNewEmail(accessToken, email);
            // console.log(res);
            await updateStatus(recipients);
          }
          await new Promise(resolve => setTimeout(resolve, 200));
          }) (ticketTypes[i])
      }
      toast.success(`Emails sent`)
    } catch (err) {
      toast.error(`Error in sending email: ${err}`)
    }
  }
  
  useEffect(() => {
    const fetchEmails = async () => {
      const reqBody = {
        sheetId: sheetId
      };
      var tickets = await getEmails(reqBody);
      if (tickets.error) {
        toast.error(`Error with getting emails: ${tickets.error}`);
      } else {
        tickets = tickets.filter(t => t.reservationStatus === 'reserved' || t.reservationStatus === 'waitlist')
        tickets.forEach(ticket => {
          ticket.name = getCapitalizedType(ticket.ticketType) + ' ' + getCapitalized(ticket.reservationStatus);
          ticket.subject = `${getCapitalizedType(ticket.ticketType)} Ticket ${getCapitalized(ticket.reservationStatus)} for ${name}`;
          ticket.message = ticket.reservationStatus === 'reserved' ?
            `Hi,\nYou have secured a ${ticket.ticketType} ticket for ${name} on ${dayjs(eventDate).format('LLLL')}.\n\nPayment Details:\n${event.paymentInfo}`
            : `Hi,\nYou have been waitlisted for a ${ticket.ticketType} ticket for ${name} on ${dayjs(eventDate).format('LLLL')}.`;
          ticket.emailEveryone = false;
        });
        console.log(tickets);
        setTicketTypes(tickets);
        setEmailLoaded(true);
      }
    };
    fetchEmails();
  }, [event, sheetId, eventDate, name]);

  const updateTickets = () => {
    setTicketTypes([...ticketTypes]);
  }

  if (!emailLoaded) {
    return (
    <div>
      <Header title={`${event.name} Email`} setUser={setUser} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <ReactLoading type={"spinningBubbles"} color={"#5e99f1"} />
      </div>
    </div>);
  }
  
  if (ticketTypes.length === 0) {
    return (
      <div>
        <Header title={`${event.name} Email`} setUser={setUser} />
        <div className="emailFormMain">
          <h1>Tickets have not been allocated</h1>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title={`${event.name} Email`} setUser = {setUser}/>
      <Container fluid>
        <div className="emailFormMain">
          <Row>
            <div className="formSection" style={{width: "100%"}}>
              <Select defaultValue={ticketOptions[0]} options={groupedOptions} style={{width: "100%"}} onChange={(v) => setTicketIndex(v.value)}/>
            </div>
          </Row>
          <br></br>
          <EmailForm
          event={event}
          ticket={ticketTypes[ticketIndex]}
          updateTickets={updateTickets}
          sendEmail={sendOne}
          sendAll={sendAll} />
        </div>
      </Container>
    </div>
  );
}