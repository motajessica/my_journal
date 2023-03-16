const express = require("express");
const registerController= require("../controllers/registerController"); 
const User = require("../models/user")
const { check, validationResult } = require('express-validator')
const passport = require("passport");

const newRegister = (req, res) => {res.render("register", {
  flash: req.flash(),
  isAuthenticated: req.isAuthenticated(),
  form:{}
});
}

const createRegister =  async (req, res)=> {
  const userExists = await User.exists({username: req.body.username});
  if (userExists) {
    res.render('register', {flash: {error: ["This email is already in use"]}, isAuthenticated: false, form: req.body});
  } else {
    User.register({username: req.body.username}, req.body.password, (err, user) => {
      const errors = validationResult(req) 
      if(!errors.isEmpty()) {
        const errorsArray = errors.array().map((obj) => {
          return obj.msg
        }); 

        const flash = {error: errorsArray} 
      
        res.render('register', {flash, isAuthenticated: false, form: req.body});
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/posts");
        });
      }
    });
  }
};

module.exports = {newRegister, createRegister}