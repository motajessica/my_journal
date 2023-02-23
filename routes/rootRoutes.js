const express = require("express");
const router = express.Router();

router.get("/", function(req, res){
    if (req.isAuthenticated()){
        res.redirect("/posts") 
    } else {
        res.render("welcome", { isAuthenticated: req.isAuthenticated()});
    }
});

module.exports = router; 