const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const Organizer = require('../models/Organizer')
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/script.projects',
  'https://www.googleapis.com/auth/script.deployments',
  'https://www.googleapis.com/auth/spreadsheets.currentonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/forms',
  'https://www.googleapis.com/auth/forms.currentonly',
  'https://www.googleapis.com/auth/script.scriptapp'];

class GoogleAppLinker {
  constructor(credentials) {
    this.credentials = credentials
  }

  setCredentials(credentials) {
    this.credentials = credentials
  }

  authorize(user, callback) {
    const { client_secret, client_id, redirect_uris } = this.credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);
    
    if (!user.token) {
      return this.getAccessToken(user, oAuth2Client, callback);
    }
    // Check if we have previously stored a token.
    oAuth2Client.setCredentials(user.token);
    callback(oAuth2Client);
  }


    /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  getAccessToken(user, oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        Organizer.findByIdAndUpdate(user._id,{token}, (err => {
          if (err) {
            console.error(err)
          }
          callback(oAuth2Client);
        }))
        // Store the token to disk for later program executions
        // fs.writeFile(this.token_path, JSON.stringify(token), (err) => {
        //   if (err) return console.error(err);
        //   console.log('Token stored to', this.token_path);
        // });
      });
    });
  }

  createForm(user, code, callback) {
    // For testing purposes
    code = code || 'function myFunction() {\n var form = FormApp.create(\'New Form\');\n var item = form.addTextItem();\n item.setTitle(\'Shortcode\');\n  var sheet = SpreadsheetApp.create("Responses", 50, 5); \n sheet.addEditor("sa-eventmanager@event-manager-cl-1597328691488.iam.gserviceaccount.com");\n form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId()); \n Logger.log(\'Published URL: \' + form.getPublishedUrl());\n Logger.log(\'Editor URL: \' + form.getEditUrl());\n   var res = {\'formResUrl\' : form.getPublishedUrl(), \'formEditUrl\' : form .getEditUrl(), \'sheetId\' : sheet.getId(), \'sheetUrl\':sheet.getUrl() }; \n return res;\n }';
    console.log(code)
    this.authorize(user, (auth) => {
    const script = google.script({ version: 'v1', auth });
    const scriptId = user.scriptId;
    const deploymentId = user.deploymentId;

    script.projects.updateContent({
      scriptId: scriptId,
      auth,
      resource: {
        files: [{
          name: 'hello',
          type: 'SERVER_JS',
          source: code,
        }, {
          name: 'appsscript',
          type: 'JSON',
          source: '{\"timeZone\":\"Europe/London\","executionApi": {"access": "ANYONE"},\"exceptionLogging\":' +
            '\"CLOUD\"}',
        }],
      },
    }, {}, (err, res) => {
      if (err) return console.log(`The API updateContent method returned an error: ${err}`);
      console.log('content updated')
      console.log(`https://script.google.com/d/${res.data.scriptId}/edit`);
  
      script.projects.versions.create({
        scriptId: scriptId,
        auth: auth,
        resource: {
          versionNumber: 1,
        }
      }, {}, (err, res) => {
        console.log(scriptId);
        console.log('this' + res.data.versionNumber);
  
  
        if (err) {
          // The API encountered a problem before the script started executing.
          return console.log('The API version create returned an error: ' + err);
        }
        console.log('version create success');
        // script.projects.deployments.create({
        //   scriptId: scriptId,
        //   auth: auth,
        //   resource: {
        //     versionNumber: res.data.versionNumber,
        //   }
        // }, {}, (err, res) => {
        console.log()
        script.projects.deployments.update({
          scriptId: scriptId,
          deploymentId: deploymentId,
          auth: auth,
          resource: {
            "deploymentConfig": {
              "versionNumber": res.data.versionNumber,
            }
          }
        }, {}, (err, res) => {
  
  
          if (err) {
            // The API encountered a problem before the script started executing.
            return console.log('The API deployments create returned an error: ' + err);
          }
          console.log('deployment success');
          console.log(res.data.deploymentId)
          console.log(res.data.deploymentConfig)
          console.log(res.data.deploymentConfig.scriptId)
  
  
          script.scripts.run({
            scriptId: scriptId,
            auth,
            resource: {
              function: 'myFunction',
              devMode: true,
            },
          }, {}, (err, res) => {
  
  
            if (err) {
              // The API encountered a problem before the script started executing.
              return console.log('The API scripts run returned an error: ' + err);
            }
            console.log(JSON.stringify(res.data))
            console.log(res.data.response.result);
            // saveItemInFolder(res.data.response.result.SHEET_ID)
            console.log('success');
            callback(res.data.response.result)
            // return res.data.response.result
          });
        });
      });
    });
    });
  }
}

module.exports = GoogleAppLinker;