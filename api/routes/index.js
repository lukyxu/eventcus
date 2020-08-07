var express = require('express');
var router = express.Router();
var authenticator = require('../helpers/authenticator')
var passport = require('passport')
var Organizer = require('../models/Organizer');

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

module.exports = router;
