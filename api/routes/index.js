var express = require('express');
var router = express.Router();
var authenticator = require('../helpers/authenticator')
var passport = require('passport')
var Organizer = require('../models/Organizer');
var Event = require('../models/Event');
var googleAppLinker = require('../helpers/googleAppLinker')
var GoogleSheetsReader = require('../helpers/googleSheets')
var GoogleFormOpener = require('../helpers/google_form_builder/GoogleFormOpener')
var Form = require('../helpers/google_form_builder/GoogleFormBuilder')
var Agenda = require('agenda')
var jsesc = require('jsesc')

/* Read sa-credentials. */
const fs = require('fs');
const readline = require('readline');
var serviceAccountEmail = '';
fs.readFile('sa-credentials.json', (err, content) => {
  if (err) return console.log('Error loading sa-credentials file:', err);
  serviceAccountEmail = JSON.parse(content).client_email;
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  if (req.isAuthenticated()) {
    authenticator.setToken(req.user._id, res)
    res.status(200).json({ isAuthenticated: true, user: req.user })
  }
});

router.post('/logout', function (req, res, next) {
  authenticator.clearToken(res)
  res.json({ success: true })
});

router.post('/register', function (req, res, next) {
  const { name, email, password } = req.body

  Organizer.findOne({ email }, (err, user) => {
    if (err) {
      res.status(500).json({ error: err })
    }
    if (user) {
      res.status(400).json({ error: "Email is already registered" })
    } else {
      const newUser = new Organizer({ name, email, password });
      newUser.save(err => {
        if (err) {
          res.status(500).json({ error: err })
        } else {
          authenticator.setToken(newUser._id, res)
          res.status(200).json({ message: "Account successfully created" })
        }
      })
    }
  })
});

router.post('/authenticate', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  res.status(200).json({ isAuthenticated: true, user: req.user });
});

const agenda = new Agenda({
  db: { address: process.env.DB_CONNECTION, collection: 'scheduler' },
  processEvery: '30 seconds',
  maxConcurrency: 1
});

agenda.start()
// (async () => {
//   await agenda.start()
//   agenda.now('openForm', {formId: '16hBNIrFtADFndtsAP8UNgWl_SuIT3ZVjKQ_BuGpjKgE', sheetId : '1p436B5I29HC-9pIULmAqN4i8oAJW7Ygttcki54PKq-E'})
//   console.log("OK")
// })();

agenda.define('openForm', { concurrency: 1 }, (job, done) => {
  console.log(job.attrs)
  console.log((new GoogleFormOpener(job.attrs.data.formId)).openForm().toFunctionString())
  googleAppLinker.createForm((new GoogleFormOpener(job.attrs.data.formId)).openForm().toFunctionString(), formRes => {
    console.log(formRes)
      done()
    })
})

router.post('/createForm', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  const body = req.body;
  let form = new Form(body.eventName)
  form.setTitle(body.eventName + " Ticket Reservation"); 
  form.setDescription(body.eventDetails);
  form.setServiceAccount(serviceAccountEmail);
  if (body.fieldsChecked.fullName) {
    form.addTextItem().setTitle("Full Name").setRequired();
  }
  if (body.fieldsChecked.shortcode) {
    form.addTextItem().setTitle("Imperial Shortcode");
  }
  // form.addMultipleChoiceItem().setTitle("Ticket Type").setChoices(body.ticketTypes.map(x => x.type + " - " + (x.price > 0 ? "(£" + x.price + ")" : "(Free)"))).setRequired()

  if (body.fieldsChecked.email) {
    form.addTextItem().setTitle("Email Address").setRequired();
  }
  if (body.fieldsChecked.contactNumber) {
    form.addTextItem().setTitle("Contact Number").setRequired();
  }
  if (body.fieldsChecked.foodAllergies) {
    form.addMultipleChoiceItem().setTitle("Do you have any allergies or dietery requirements?").setChoices(["Yes", "No"]).setRequired();
    form.addTextItem().setTitle("If yes, please specify")
  }

  form.addMultipleChoiceItem().setTitle("Ticket Type").setChoices(body.ticketTypes.map(x => {x.type = x.type + " " + (x.price > 0 ? "(£" + x.price + ")" : "(Free)"); return x.type})).setRequired()

  form.linkWithSheets()

  form.setFormOpenTime(new Date(body.ticketRelease))
  console.log(form.toFunctionString())
  if (form.formClosed()) {
    console.log("CLOSED")
  }
  googleAppLinker.createForm(form.toFunctionString(), formRes => {
    const { sheetId, formId, sheetUrl, formEditUrl, formResUrl } = formRes;
    console.log(sheetUrl)
    const newEvent = new Event({ name: body.eventName, description: body.eventDetails, dropTime: new Date(body.ticketRelease), hosts: [req.user._id], sheetId, formId, sheetUrl, formEditUrl, formResUrl, eventDate: body.eventDate, paymentInfo: body.paymentInfo })
    newEvent.save(err => {
      console.error(err)
    })

    agenda.schedule(new Date(body.ticketRelease), 'openForm', { formId })

    console.log(sheetId);
    let reader = new GoogleSheetsReader(sheetId);
    reader.init(async () => { await reader.configSheet(body.ticketTypes); res.json({ success: true }) });
  });
});

router.get('/events', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  Event.find({ hosts: req.user._id }, (err, events) => {
    if (err) {
      console.log(err)
      res.status(500).json({ error: err })
    }
    res.status(200).json(events)
  })
});

router.post('/allocate', function (req, res, next) {
  const sheetId = req.body.sheetId;
  console.log(sheetId);
  let reader = new GoogleSheetsReader(sheetId);
  reader.init(async () => { await reader.allocate(); res.json({ success: true }) });
});

router.post('/ticketReservationInfo', function (req, res, next) {
  const sheetId = req.body.sheetId;
  console.log(sheetId);
  let reader = new GoogleSheetsReader(sheetId);
  reader.init(() => {
    reader.ticketReservationInfo((data) => {
      console.log(data);
      res.json(data);
    });
  });
});

router.post('/getEmailsAndTicketTypes', function (req, res, next) {
  const sheetId = req.body.sheetId;
  console.log(sheetId);
  let reader = new GoogleSheetsReader(sheetId);
  reader.init(() => {
    reader.getEmailsAndTicketTypes((data) => {
      console.log(data);
      res.json(data);
    });
  });

});

router.post('/getTicketAllocations', function (req, res, next) {
  const sheetId = req.body.sheetId;
  console.log(sheetId);
  let reader = new GoogleSheetsReader(sheetId);
  reader.init(() => {
    reader.getTicketAllocations((data) => {
      res.json(data);
      console.log(data)
    });
  });

});

router.post('/changePaymentStatus', function (req, res, next) {
  const sheetId = req.body.sheetId;
  console.log(sheetId);
  let reader = new GoogleSheetsReader(sheetId);
  reader.init(async () => {await reader.changePaymentStatus(req.body.timestamp, req.body.fullName); res.status(200).json({success:true})});
});

router.post('/changeReservationStatus', function (req, res, next) {
  const sheetId = req.body.sheetId;
  console.log(sheetId);
  console.log(req.body.ticketType)
  console.log(req.body.reservationStatus)
  let reader = new GoogleSheetsReader(sheetId);
  reader.init(async () => {await reader.changeReservationStatus(req.body.timestamp, req.body.fullName, req.body.ticketType, req.body.reservationStatus); res.status(200).json({success: true})});
});

router.post('/updateEmailStatus', function (req, res, next) {
  const sheetId = req.body.sheetId;
  console.log(sheetId);
  let reader = new GoogleSheetsReader(sheetId);
  reader.init(async () => { await reader.updateEmailStatus(req.body.email); res.status(200); res.json({ success: true }) });
});


// const test = `🍚🍜HANCHI KID TAIWANESE FOOD DELIVERY🍚🍜
// Hanchi Kid expanded their menu! Visit their website to order now: http://hanchikid.co.uk/ 👀
// Hey guys! Now's your chance to try out Hanchi Kid's authentic Taiwanese food! For this Thursday (21st May) they will be delivering exclusively to the following postcodes:
// W1, WC1, W2, W6, W8, W14;
// SW3, SW5, SW6, SW7.
// If you missed our last post, Hanchi Kid showcases home-cooked Taiwanese dishes cooked by a mother and son duo! Everything is made fresh and ingredients are sourced from Taiwan where possible. Check out the post below for more details! ❤`

// console.log(jsesc(test))

module.exports = router;
