const JWT = require('jsonwebtoken')
const tokenName = "access_token"
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const Organizer = require('../models/Organizer')
require('dotenv').config()

class Authenticator {

    constructor() {
        // this.key = secureRandom(256, {type: "Buffer"})
        this.key = process.env.AUTH_KEY
        this.initializeAuthentication()
        this.initializeAuthorization()
    }

    signToken(userId, expiry) {
      if (!expiry) {
        expiry = "24h"
      }
      return JWT.sign({
        iss: "evently",
        sub: userId
      }, this.key, {expiresIn: expiry})
    }

    setToken(userId, res) {
      const token = this.signToken(userId);
      res.cookie(tokenName, token, {httpOnly: true});
    }

    clearToken(res) {
      res.clearCookie(tokenName);
    }

    getToken(req) {
      let token = null
      if (req && req.cookies) {
        token = req.cookies[tokenName];
      }
      return token;
    }
    
    initializeAuthentication() {
      passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'},
      (email, password, done) => {
        Organizer.findOne({email}, (err, user) => {
          if (err) {
            return done(err)
          }
          if (!user) {
            return done(null, false)
          }
          user.comparePassword(password, done)
        })
      }))
    }

    initializeAuthorization() {
      passport.use(new JwtStrategy({
        jwtFromRequest: this.getToken,
        secretOrKey: this.key
      }, (payload, done) => {
        Organizer.findById({_id: payload.sub}, (err,user) => {
          if(err) {
            return done(err,false);
          }
          if(user) {
            return done(err, user);
          }
          return done(null, false)
        })
      }))
    }
}

module.exports = new Authenticator();