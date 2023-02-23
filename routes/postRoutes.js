const express = require("express");
const router = express.Router();
const { validationResult } = require('express-validator');
const mongoose = require("mongoose");
const _ = require("lodash");
const getDate = require('../helpers/dateHelper');
const {Post, postValidations} = require("../models/post")
const postsController= require("../controllers/postsController"); 

  // INDEX 
router.get("/posts", async function(req, res){
 
  if (req.isAuthenticated()){
    let posts = await Post.find({userId: req.user.id})
    posts.forEach(function(post){
      post.title = _.capitalize(post.title)
    });
    res.render("posts/index",{
      posts: posts.reverse(),
      isAuthenticated: req.isAuthenticated(),
      today: getDate(),
      flash: req.flash()
    });
  } else {
    res.redirect("/");
  }
});
  
// NEW

router.get("/new", postsController.newPost);
  
// CREATE
  
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
router.get("/posts/:id", function(req, res){
  if (req.isAuthenticated()){
    const requestedPostId = req.params.id;
    Post.findOne({_id:requestedPostId}, function(err, post){
      console.log(post);
        res.render("posts/show", {
          title: _.capitalize(post.title),
          content: post.content,
          isAuthenticated: req.isAuthenticated(),
          id: post.id,
          updatedAt: post.updatedAt,
          flash: req.flash()
        });
    });
  } else {
    res.redirect("/");
  };
});
  
// EDIT
router.get("/posts/:id/edit", function(req, res){
  if (req.isAuthenticated()){
    const requestedPostId = req.params.id;
    Post.findOne({_id:requestedPostId}, function(err, post){
      console.log(post);
        res.render("posts/edit", {
          title: post.title,
          content: post.content,
          isAuthenticated: req.isAuthenticated(),
          id: post.id
        });
    });
  } else {
    res.redirect("/");
  };
});

//  UPDATE
router.post("/posts/:id/update", function(req, res){
  if(req.isUnauthenticated()) {
    res.redirect("/")
  } else {
    const filter = {_id: req.body.id};
    const update = {title: req.body.title, content: req.body.content}
    Post.findOneAndUpdate(filter, update, function(err, post){
      console.log(post);
      if (err){
        res.render("/posts/edit");
      } else {
        req.flash('success','Your message has been edited!');
        res.redirect(`/posts/${post._id}`);
      };
    });
  };
});
  
//  DELETE
router.post("/posts/:id", function(req, res){
  if (req.isAuthenticated()){
    const requestedPostId = req.params.id;
    Post.findByIdAndRemove({_id:requestedPostId}, function(err, post){
      if(!!err) {
        res.render("post", {
          title: post.title,
          content: post.content,
          isAuthenticated: req.isAuthenticated(),
        });
      } else {
          req.flash('success','Your message has been deleted!');
          return res.redirect("/posts")
      }
    });
  } else {
    res.redirect("/");
  }
});

module.exports = router;  

