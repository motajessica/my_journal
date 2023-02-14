const express = require("express");
const router = express.Router();

router.get("/contact", function(req, res){
    res.render("contact", {
      isAuthenticated: req.isAuthenticated()
    });
  });

module.exports = router