const express = require("express");
const bodyParser = require("body-parser");
const { check, validationResult } = require('express-validator')
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const registerController= require("../controllers/registerController");  
const User = require("../models/user")

passport.use(User.createStrategy());
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

// Passport Google - Config Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/myjournal"
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile);
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));

router.get ("/register", registerController.newRegister)
  
const registerChecks = [
  check("username", "Email is not valid").isEmail()
    .normalizeEmail(),
  check("password", "Password is not valid")
    .isLength({ min: 3})
]

router.post("/register", urlencodedParser, registerChecks, registerController.createRegister );

module.exports = router;  