var graph = require('@microsoft/microsoft-graph-client');

function getAuthenticatedClient(accessToken) {
  // Initialize Graph client
  const client = graph.Client.init({
    // Use the provided access token to authenticate
    // requests
    authProvider: (done) => {
      done(null, accessToken);
    }
  });

  return client;
}

export async function sendNewEmail(accessToken, message) {
  const client = getAuthenticatedClient(accessToken);
  const mail = {
    "message": message,
    // "saveToSentItems": "false"
  };
  let res = await client.api('/me/sendMail').post(mail);
  return res;
}