const express = require("express");
const router = express.Router();

router.get("/", function(req, res){
    if (req.isAuthenticated()){
        res.redirect("/posts") 
    } else {
        res.render("welcome", { isAuthenticated: req.isAuthenticated()});
    }
});

router.get("/about", function(req, res){
  res.render("about", {
    isAuthenticated: req.isAuthenticated()
  });
});

router.get("/contact", function(req, res){
    res.render("contact", {
      isAuthenticated: req.isAuthenticated()
    });
  });

module.exports = router; 