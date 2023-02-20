const express = require("express");
const router = express.Router();
const { validationResult } = require('express-validator');
const mongoose = require("mongoose");
const _ = require("lodash");
const getDate = require('../helpers/dateHelper');
const {Post, postValidations} = require("../models/post")

  // INDEX HOME
router.get("/", async function(req, res){
 
  if (req.isAuthenticated()){
    let posts = await Post.find({userId: req.user.id})
    posts.forEach(function(post){
      post.title = _.capitalize(post.title)
    });
    res.render("home",{
      posts: posts.reverse(),
      isAuthenticated: req.isAuthenticated(),
      today: getDate(),
      flash: req.flash()
    });
  } else {
    res.redirect("welcome");
  }
});
router.get("/welcome", function(req, res){
  res.render("welcome", { isAuthenticated: req.isAuthenticated()});
});
  
  // NEW
router.get("/compose", function(req, res){
  if(req.isUnauthenticated()) {
    res.redirect("/welcome")
  } else {
    res.render("compose", {
      isAuthenticated: req.isAuthenticated(),
      flash: {},
      postTitle: null,
      postBody: null,
      postId: null
    });
  }
});
  
  // CREATE
  
router.post("/compose", postValidations, function(req, res){
  if(req.isUnauthenticated()) {
    res.redirect("/welcome")
  } else {
    console.log(req.body)
    const post = new Post ({
      title: req.body.postTitle,
      content: req.body.postBody,
      userId: req.user.id
    });
      post.save(function(err){
        let errors = validationResult(req) 

        if(!errors.isEmpty()) {
          errors = errors.array().map(function(obj) {
            return obj.msg
          })
        
            const flash = {error: errors}
            res.render('compose', {
            flash,
            isAuthenticated: req.isAuthenticated(),
            postTitle: post.postTitle,
            postBody: post.postBody,
            postId: post.id
            });   
          } else { 
            req.flash('success','Your post has been created!');
            res.redirect("/");  
        }
      });
  };
});
  
  // SHOW
router.get("/posts/:postId", function(req, res){
  if (req.isAuthenticated()){
    const requestedPostId = req.params.postId;
    Post.findOne({_id:requestedPostId}, function(err, post){
      console.log(post);
        res.render("post", {
          title: _.capitalize(post.title),
          content: post.content,
          isAuthenticated: req.isAuthenticated(),
          postId: post.id,
          updatedAt: post.updatedAt,
          flash: req.flash()
        });
    });
  } else {
    res.redirect("/welcome");
  };
});
  
// EDIT
router.get("/posts/:postId/edit", function(req, res){
  if (req.isAuthenticated()){
    const requestedPostId = req.params.postId;
    Post.findOne({_id:requestedPostId}, function(err, post){
      console.log(post);
        res.render("edit", {
          postTitle: post.title,
          postBody: post.content,
          isAuthenticated: req.isAuthenticated(),
          postId: post.id
        });
    });
  } else {
    res.redirect("/welcome");
  };
});

//  UPDATE
router.post("/posts/:postId/update", function(req, res){
  if(req.isUnauthenticated()) {
    res.redirect("/welcome")
  } else {
    const filter = {_id: req.body.postId};
    const update = {title: req.body.postTitle, content: req.body.postBody}
    Post.findOneAndUpdate(filter, update, function(err, post){
      console.log(post);
      if (err){
        res.render("edit");
      } else {
        req.flash('success','Your message has been edited!');
        res.redirect(`/posts/${post._id}`);
      };
    });
  };
});
  
//  DELETE
router.post("/posts/:postId", function(req, res){
  if (req.isAuthenticated()){
    const requestedPostId = req.params.postId;
    Post.findByIdAndRemove({_id:requestedPostId}, function(err, post){
      if(!!err) {
        res.render("post", {
          title: post.title,
          content: post.content,
          isAuthenticated: req.isAuthenticated(),
        });
      } else {
          req.flash('success','Your message has been deleted!');
          return res.redirect("/")
      }
    });
  } else {
    res.redirect("/welcome");
  }
});

module.exports = router;  

