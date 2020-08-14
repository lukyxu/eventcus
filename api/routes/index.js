var express = require('express');
var router = express.Router();
var authenticator = require('../helpers/authenticator')
var passport = require('passport')
var Organizer = require('../models/Organizer');
var googleAppLinker = require('../helpers/googleAppLinker')
var Form = require('../helpers/google_form_builder/GoogleFormBuilder')

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
  const {firstName, lastName, email, password} = req.body

  Organizer.findOne({email}, (err, user) => {
    if (err) {
      res.status(500).json({error: err}) 
    }
    if (user) {
      res.status(400).json({error: "Email is already registered"})
    } else {
      const newUser = new Organizer({firstName, lastName, email, password});
      newUser.save(err => {
        if (err) {
          res.status(500).json({error: err}) 
        } else {
          Authenticator.setToken(newUser._id ,res)
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
  req = {
    eventName: "Boat Party",
    eventDetails: "A fun time",
    fullName: true,
    shortCode: true,
    email: true,
    contactNumber: true,
    foodAllergies: true
  }
  let form = new Form(req.eventName)
  form.setTitle(req.eventName + " Ticket Reservation");
  form.setDescription(req.eventDetails)
  if (req.fullName) {
    form.addTextItem().setTitle("Full Name").setRequired();
  }
  if (req.shortCode) {
    form.addTextItem().setTitle("Imperial Shortcode");
  }
  if (req.email) {
    form.addTextItem().setTitle("Email Address").setRequired();
  }
  if (req.contactNumber) {
    form.addTextItem().setTitle("Contact Number").setRequired();
  }
  if (req.foodAllergies) {
    form.addMultipleChoiceItem().setTitle("Do you have any allergies or dietery requirements?").setChoices(["Yes", "No"]).setRequired();
    form.addTextItem().setTitle("If yes, please specify")
  }

  form.linkWithSheets()

  googleAppLinker.createForm(form.toFunctionString())
  console.log(form.toFunctionString())
});

module.exports = router;
