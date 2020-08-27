import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from "react-hook-form";
import { Button, Spinner, Row, Container } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { config } from "../services/config";
import { UserAgentApplication } from 'msal';
import { getUserDetails } from '../services/graphService';
import { sendNewEmail } from '../services/graphService';

export default function EmailForm() {
  // const history = useHistory();
  // const [loadingSend, setLoadingSend] = useState(false)

  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({})

  const info = [{
    type: "normal",
    reservationstatus: "reserved",
    emails: ["app-test1@outlook.com", "ben@gmail.com"]
  }, {
    type: "vip",
    reservationstatus: "reserved",
    emails: ["app-test1@outlook.com", "ben@gmail.com"]
  }, {
    type: "normal",
    reservationstatus: "waitlist",
    emails: ["app-test1@outlook.com", "ben@gmail.com"]
  }];

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

  const { register, handleSubmit, errors } = useForm({
    criteriaMode: "all",
    defaultValues: {
      messageNormal: "Hi,\nYou have secured a normal ticket.\nPayment Details:\nXXXXX",
      messageVip: "Hi,\nYou have secured a vip ticket.\nPayment Details:\nXXXXX",
      messageNormalWaitlist: "Hi,\nYou have been waitlisted for a normal ticket."
    }
  });

  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      login();
    } else {
      // setLoadingSend(true)
      const normal = info[info.findIndex(x => x.type === 'normal' && x.reservationstatus === 'reserved')]
      console.log(data.messageNormal);
      var accessToken = await getAccessToken(config.scopes);
      const message = {
        "subject": "Test email",
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
      sendNewEmail(accessToken, message);
      // let res = await PostForm(data);
      // console.log(res)
      // history.push('/')
    }
  }; // your form submit function which will invoke after successful validation

  // const renderSendButton = () => {
  //   if (loadingSend) {
  //     return <Button className="blueButton" type="submit" disabled>
  //       <Spinner
  //         as="span"
  //         animation="border"
  //         size="sm"
  //         role="status"
  //         aria-hidden="true"
  //         style={{ marginRight: "5px", marginBottom: "2px" }}
  //       />
  //        Sending...
  //     </Button>
  //   } else {
  //     return <Button className="blueButton" type="submit">Send</Button>
  //   }
  // }

  return (
    <Container fluid className="eventFormMain">
      {isAuthenticated ? (<Button onClick={() => logout()}>Sign Out</Button>) : null}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row className="formSection">
          <h5>Email Content (Normal)</h5>
          <textarea
            className="fieldInput"
            name="messageNormal"
            placeholder="Email content for normal tickets holder"
            rows="8"
            ref={register({ required: true })}
          />
          {errors.messageNormal && <p className="eventFormErrorMessage">This field is required</p>}
        </Row>
        <Row className="formSection">
          <h5>Email Content (Vip)</h5>
          <textarea
            className="fieldInput"
            name="messageVip"
            placeholder="Email content for vip tickets holder"
            rows="8"
            ref={register({ required: true })}
          />
          {errors.messageVip && <p className="eventFormErrorMessage">This field is required</p>}
        </Row>
        <Row className="formSection">
          <h5>Email Content (Normal Waitlist)</h5>
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
          {/* {renderSendButton()} */}
          <Button className="blueButton" type="submit">Send</Button>
        </Row>
      </form>
    </Container>
  );
}