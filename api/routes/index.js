var express = require('express');
var router = express.Router();
var authenticator = require('../helpers/authenticator')
var passport = require('passport')
var Organizer = require('../models/Organizer');
var googleAppLinker = require('../helpers/googleAppLinker')
var GoogleSheetsReader = require('../helpers/googleSheets')
var Form = require('../helpers/google_form_builder/GoogleFormBuilder')

/* Read sa-credentials. */
const fs = require('fs');
const readline = require('readline');
var serviceAccountEmail ='';
fs.readFile('sa-credentials.json', (err, content) => {
  if (err) return console.log('Error loading sa-credentials file:', err);
  serviceAccountEmail  = JSON.parse(content).client_email;
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', passport.authenticate('local', {session:false}), (req, res) => {
  if (req.isAuthenticated()) {
    authenticator.setToken(req.user._id, res)
    res.status(200).json({isAuthenticated: true, user: req.user})
  }
});

router.post('/logout', function(req, res, next) {
  authenticator.clearToken(res)
  res.json({success: true})
});

router.post('/register', function(req, res, next) {
  const {name, email, password} = req.body

  Organizer.findOne({email}, (err, user) => {
    if (err) {
      res.status(500).json({error: err}) 
    }
    if (user) {
      res.status(400).json({error: "Email is already registered"})
    } else {
      const newUser = new Organizer({name, email, password});
      newUser.save(err => {
        if (err) {
          res.status(500).json({error: err}) 
        } else {
          authenticator.setToken(newUser._id ,res)
          res.status(200).json({message: "Account successfully created"}) 
        }
      })
    }
  })
});

router.post('/authenticate', passport.authenticate('jwt',{session : false}), function(req, res, next) {
  res.status(200).json({isAuthenticated : true, user : req.user});
});

router.post('/createForm', function(req, res, next) {
  const body = req.body;
  // console.log(req)
  // req = {
  //   eventName: "Boat Party",
  //   eventDetails: "A fun time",
  //   fullName: true,
  //   shortCode: true,
  //   email: true,
  //   contactNumber: true,
  //   foodAllergies: true
  // }
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
  form.addMultipleChoiceItem().setTitle("Ticket Type").setChoices(body.ticketTypes.map(x => x.type + " - " + (x.price > 0 ? "(£" + x.price + ")" : "(Free)"))).setRequired()
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

  form.linkWithSheets()

  googleAppLinker.createForm(form.toFunctionString(), formRes => {
    const sheetId = formRes.sheetId;
    console.log(sheetId);
    res.json({success : true});
    let reader = new GoogleSheetsReader(sheetId);
    reader.init(() => reader.configSheet(body.ticketTypes));
  });


  // console.log('here')

  // console.log(googleAppLinker.createForm(form.toFunctionString()))
  // console.log(form.toFunctionString())
  



});

router.post('/readRows', function(req, res, next) {
  const sheetId = req.body.sheetId;
  let reader = new GoogleSheetsReader(sheetId);
  reader.init((r) => reader.getHeaders(r));
})

module.exports = router;
