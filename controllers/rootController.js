const express = require("express");

const welcome = function(req, res){
  if (req.isAuthenticated()){
    res.redirect("/posts") 
  } else {
    res.render("welcome", {isAuthenticated: req.isAuthenticated()});
  }
};

const contact = function(req, res){
  res.render("contact", {
    isAuthenticated: req.isAuthenticated()
  });
};
 
const about = function(req, res){
  res.render("about", {
    isAuthenticated: req.isAuthenticated()
  });
};

module.exports = {welcome, contact, about}