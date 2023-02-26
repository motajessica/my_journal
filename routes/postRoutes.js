const express = require("express");
const router = express.Router();
const { validationResult } = require('express-validator');
const mongoose = require("mongoose");
//
const _ = require("lodash");
//
const getDate = require('../helpers/dateHelper');
// 
const {Post, postValidations} = require("../models/post")
const postsController= require("../controllers/postsController"); 

  // Index 
router.get("/posts", postsController.index);
   
// New
router.get("/new", postsController.compose);
  
// Create 
router.post("/posts", postValidations, postsController.create)
  
  // SHOW
router.get("/posts/:id", postsController.show)

// EDIT
router.get("/posts/:id/edit", postsController.edit)

//  UPDATE
router.post("/posts/:id/update", postsController.update);
  
//  DELETE
router.post("/posts/:id", postsController.destroy)

module.exports = router;  