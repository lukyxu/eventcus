import React, { useEffect, useState, useCallback } from 'react';
import { UserAgentApplication } from 'msal';
import { config } from '../services/config';
import { getUserDetails } from '../services/graphService';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import Header from '../components/header';
import Welcome from '../components/welcome';
import SendEmail from '../components/send-email';
import { Container } from 'react-bootstrap';

export default function Board() {
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

  function setErrorMessage(message, debug) {
    setError({ message: message, debug: debug })
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

  return (
    <Router>
      <div>
        <Header
          title="Dashboard"
          isAuthenticated={isAuthenticated}
          authButtonMethod={isAuthenticated ? (() => logout()) : (() => login())}
          user={user} />

        <Container>
          <Route exact path="/"
            render={(props) =>
              <Welcome {...props}
                isAuthenticated={isAuthenticated}
                user={user}
                authButtonMethod={() => login()} />
            } />
          <Route exact path='/send-email'
            render={(props) =>
              isAuthenticated ?
                <SendEmail {...props}
                  user={user} getAccessToken={(scopes) => getAccessToken(scopes)} /> :
                <Redirect to="/" />
            } />
        </Container>
      </div>
    </Router>
  );
}