import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from "react-hook-form";
import { Button, Spinner, Row, Container } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { config } from "../services/config";
import { UserAgentApplication } from 'msal';
import { getUserDetails } from '../services/graphService';
import { sendNewEmail } from '../services/graphService';

async function getEmails(reqBody) {
  let res = await fetch('/getEmailsAndTicketTypes', {
    method: "post",
    body: JSON.stringify(reqBody),
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include"
  })
  if (res.status === 401) {
    console.log(`ERROR: ${res.status}`)
    return null
  }
  return await res.json();
}

export default function EmailForm({ event, sheetId }) {
  // const history = useHistory();
  const [loadingSend, setLoadingSend] = useState(false)

  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({})

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

  const getUserProfile = useCallback(
    async () => {
      try {
        var accessToken = await getAccessToken(config.scopes);
        if (accessToken) {
          // Get the user's profile from Graph
          var user = await getUserDetails(accessToken);
          setIsAuthenticated(true);
          setUser({
            displayName: user.displayName,
            email: user.mail || user.userPrincipalName
          });
          setError(null);
        }
      }
      catch (err) {
        setIsAuthenticated(false);
        setUser({});
        setError(normalizedError(err));
      }
    },
    [getAccessToken],
  )

  // If MSAL already has an account, the user is already logged in
  useEffect(() => {
    var account = userAgentApplication.getAccount();

    if (account) {
      // Enhance user object with data from Graph
      getUserProfile();
    }
  }, [userAgentApplication, getUserProfile])

  async function login() {
    try {
      // Login via popup
      await userAgentApplication.loginPopup(
        {
          scopes: config.scopes,
          prompt: "select_account"
        });
      // After login, get the user's profile
      await getUserProfile();
    }
    catch (err) {
      setIsAuthenticated(false);
      setUser({});
      setError(normalizedError(err));
    }
  }

  function logout() {
    userAgentApplication.logout();
  }

  function normalizedError(error) {
    var normalizedError = {};
    if (typeof (error) === 'string') {
      var errParts = error.split('|');
      normalizedError = errParts.length > 1 ?
        { message: errParts[1], debug: errParts[0] } :
        { message: error };
    } else {
      normalizedError = {
        message: error.message,
        debug: JSON.stringify(error)
      };
    }
    return normalizedError;
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

  const normalPrice = event.ticketTypes[event.ticketTypes.findIndex(x => x.type === 'normal')].price;
  const vipPrice = event.ticketTypes[event.ticketTypes.findIndex(x => x.type === 'vip')].price;

  const { register, handleSubmit, errors } = useForm({
    criteriaMode: "all",
    defaultValues: {
      messageNormal: `Hi,\nYou have secured a normal ticket with price £${normalPrice}.\nPayment Details:\nXXXXX`,
      messageVip: `Hi,\nYou have secured a vip ticket with price £${vipPrice}.\nPayment Details:\nXXXXX`,
      messageNormalWaitlist: "Hi,\nYou have been waitlisted for a normal ticket."
    }
  });

  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      login();
    } else {
      setLoadingSend(true)
      var accessToken = await getAccessToken(config.scopes);
      const reqBody = {
        sheetId: sheetId
      };
      const info = await getEmails(reqBody);
      const normal = info[info.findIndex(x => x.ticketType === "normal" && x.reservationStatus === "reserved")];
      const vip = info[info.findIndex(x => x.ticketType === "vip" && x.reservationStatus === "reserved")];
      const normalWaitlist = info[info.findIndex(x => x.ticketType === "normal" && x.reservationStatus === "waitlist")];
      const emailNormal = {
        "subject": `Ticket information for ${event.eventName}`,
        "body": {
          "contentType": "Text",
          "content": data.messageNormal
        },
        "bccRecipients": normal.emails.map(email => {
          return ({
            "emailAddress": {
              "address": email
            }
          })
        })
      }
      const emailVip = {
        "subject": `Ticket information for ${event.eventName}`,
        "body": {
          "contentType": "Text",
          "content": data.messageVip
        },
        "bccRecipients": vip.emails.map(email => {
          return ({
            "emailAddress": {
              "address": email
            }
          })
        })
      }
      const emailNormalWaitlist = {
        "subject": `Ticket information for ${event.eventName}`,
        "body": {
          "contentType": "Text",
          "content": data.messageNormalWaitlist
        },
        "bccRecipients": normalWaitlist.emails.map(email => {
          return ({
            "emailAddress": {
              "address": email
            }
          })
        })
      }
      let res
      try {
        // res = await sendNewEmail(accessToken, emailNormal);
        // console.log(res);
        // res = await sendNewEmail(accessToken, emailVip);
        // console.log(res);
        // res = await sendNewEmail(accessToken, emailNormalWaitlist);
        // console.log(res);
        alert("Emails Sent")
      } catch (err) {
        alert(err)
      }
      setLoadingSend(false);
      // history.push('/')
    }
  }; // your form submit function which will invoke after successful validation

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
        <Row className="formSection" style={{marginBottom: "15px"}}>
          <h4>Email Content (Normal)</h4>
          <textarea
            className="fieldInput"
            name="messageNormal"
            placeholder="Email content for normal tickets holder"
            rows="8"
            ref={register({ required: true })}
          />
          {errors.messageNormal && <p className="eventFormErrorMessage">This field is required</p>}
        </Row>
        <Row className="formSection" style={{ marginBottom: "15px" }}>
          <h4>Email Content (Vip)</h4>
          <textarea
            className="fieldInput"
            name="messageVip"
            placeholder="Email content for vip tickets holder"
            rows="8"
            ref={register({ required: true })}
          />
          {errors.messageVip && <p className="eventFormErrorMessage">This field is required</p>}
        </Row>
        <Row className="formSection" style={{ marginBottom: "15px" }}>
          <h4>Email Content (Normal Waitlist)</h4>
          <textarea
            className="fieldInput"
            name="messageNormalWaitlist"
            placeholder="Email content for normal tickets waitlist"
            rows="8"
            ref={register({ required: true })}
          />
          {errors.messageNormalWaitlist && <p className="eventFormErrorMessage">This field is required</p>}
        </Row>
        <Row className="formSection">
          <hr></hr>
          {renderSendButton()}
        </Row>
      </form>
    </Container>
  );
}