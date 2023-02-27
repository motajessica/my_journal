const express = require("express");
const router = express.Router();
const rootController= require("../controllers/rootController");  

router.get("/", rootController.welcome )

router.get("/about", rootController.about)

router.get("/contact", rootController.contact )

module.exports = router; t
