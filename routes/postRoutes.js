const express = require("express");
const router = express.Router();
const { validationResult } = require('express-validator');
const mongoose = require("mongoose");
const {Post, postValidations} = require("../models/post")
const postsController= require("../controllers/postsController");  

router.get("/posts", postsController.index);
   
router.get("/new", postsController.compose);
  
router.post("/posts", postValidations, postsController.create)
  
router.get("/posts/:id", postsController.show)

router.get("/posts/:id/edit", postsController.edit)

router.post("/posts/:id/update", postValidations, postsController.update);
  
router.post("/posts/:id", postsController.destroy)

module.exports = router;  