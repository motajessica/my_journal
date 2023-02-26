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
router.post("/posts", postValidations, function(req, res){
  if(req.isUnauthenticated()) {
    res.redirect("/")
  } else {
    console.log(req.body)
    const post = new Post ({
      title: req.body.title,
      content: req.body.content,
      userId: req.user.id
    });
        
    let errors = validationResult(req) 
    
    if(!errors.isEmpty()) {
      errors = errors.array().map(function(obj) {
        return obj.msg
      });
      const flash = {error: errors}
      res.render('posts/new', {
        flash,
        isAuthenticated: req.isAuthenticated(),
        title: post.title,
        content: post.content,
        id: post.id
      });  
    } else { 
      post.save(function(err){
        if (err) {
          req.flash('error', err.message); 
        } else {
          req.flash('success','Your post has been created!');
        }
        res.redirect("/posts");
      })
    } 
  };
});
  
  // SHOW
router.get("/posts/:id", postsController.show)

// EDIT
router.get("/posts/:id/edit", postsController.edit)

//  UPDATE
router.post("/posts/:id/update", postsController.update);
  
//  DELETE
router.post("/posts/:id", postsController.destroy)

module.exports = router;  

