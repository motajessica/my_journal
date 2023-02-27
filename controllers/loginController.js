const express = require("express");

const login = function(req, res){
  res.render("login", {
    isAuthenticated: req.isAuthenticated(), 
    flash: req.flash()
    });
};

const logout = function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect("/posts");
  });
};

const authentication = function(req, res) {
    res.redirect("/posts");
}

module.exports = {login, logout, authentication}