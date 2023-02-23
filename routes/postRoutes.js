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
router.get("/posts", postsController.cPosts);
   
// New
router.get("/new", postsController.newPost);
  
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
router.get("/posts/:id", postsController.showPost)

// EDIT
router.get("/posts/:id/edit", postsController.editPost)


//  UPDATE
router.post("/posts/:id/update", postsController.updatePost);
  
//  DELETE
router.post("/posts/:id", postsController.deletePost)

module.exports = router;  

