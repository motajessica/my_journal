const express = require("express");
const router = express.Router();
const flash = require('connect-flash');
const passport = require("passport")
const loginController = require("../controllers/loginController")

router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

router.get("/auth/google/myjournal", passport.authenticate("google", { failureRedirect: "/" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/posts");
});

router.get("/login", loginController.login);

router.get("/logout", loginController.logout);

const authenticate =  passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Invalid username or password!',
  successRedirect: '/posts', 
  successFlash: 'Success login' 
});

router.post("/login", authenticate);

module.exports = router;  