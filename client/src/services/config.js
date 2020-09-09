export const config = {
  appId: '3b1b779a-2bdc-40ad-9897-c2989a8788b7',
  redirectUri: 'http://localhost:3000',
  scopes: [
    'user.read',
    'mail.send'
  ]
  // auth: {
  //   clientId: "3b1b779a-2bdc-40ad-9897-c2989a8788b7",
  //   authority: "https://login.microsoftonline.com/common",
  //   redirectUri: "http://localhost:3000",
  // },
  // cache: {
  //   cacheLocation: "sessionStorage", // This configures where your cache will be stored
  //   storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  // }
};

// // Add scopes here for ID token to be used at Microsoft identity platform endpoints.
// export const loginRequest = {
//   scopes: ["openid", "profile", "User.Read"]
// };

// // Add scopes here for access token to be used at Microsoft Graph API endpoints.
// export const tokenRequest = {
//   scopes: ["User.Read", "Mail.Read"]
// }