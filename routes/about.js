const express = require('express')
const router = express.Router();

 router.get("/about", function(req, res){
    res.render("about", {
      isAuthenticated: req.isAuthenticated()
    });
  });
  
  module.exports = router;  