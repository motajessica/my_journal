const express = require("express");

const login = (req, res) => {
  res.render("login", {
    isAuthenticated: req.isAuthenticated(),
    flash: req.flash()
  })
}

const logout = (req, res) => req.logout((err) => {
  if (err) { return next(err); }
  res.redirect("/");
});

const authentication = (req, res) => {
  res.redirect("/posts");
}

module.exports = {login, logout, authentication}