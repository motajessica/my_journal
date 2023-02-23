const express = require("express");
const router = express.Router();
const passport = require("passport");
const flash = require('connect-flash');

router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

router.get("/auth/google/myjournal", passport.authenticate("google", { failureRedirect: "/" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/posts");
});

router.get("/login", function(req, res){
  res.render("login", {isAuthenticated: req.isAuthenticated(), flash: req.flash()});
});

router.get("/logout", function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect("/posts");
  });
});

const authenticate =  passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Invalid username or password!',
  successRedirect: '/posts', 
  successFlash: 'Success login'
});

router.post("/login", authenticate, function(req, res){});

module.exports = router;  