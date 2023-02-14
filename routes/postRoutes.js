const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const _ = require("lodash");
const getDate = require('../helpers/dateHelper');


const postSchema = mongoose.Schema({
    title: String,
    content: String,
    userId: String
  }, {timestamps: true});

const Post = mongoose.model("Post", postSchema);
  
  // INDEX HOME
router.get("/", async function(req, res){
  const success = req.flash('success')
  if (req.isAuthenticated()){
    let posts = await Post.find({userId: req.user.id})
    posts.forEach(function(post){
      post.title = _.capitalize(post.title)
    });
    const alert = (success || []).map((message) => {
      return {msg: message}
    });
    res.render("home",{
      alert: alert,
      posts: posts.reverse(),
      isAuthenticated: req.isAuthenticated(),
      today: getDate()
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
      postTitle: null,
      postBody: null,
      postId: null
    });
  }
});
  
  // CREATE
router.post("/compose", function(req, res){
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
       if (!err){
        req.flash('success','Your message has been saved');
        res.redirect("/");
       };
     });
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
        req.flash('success','Your message has been edited');
        res.redirect(`/posts/${post._id}`);
      };
    });
  };
});
  
  // SHOW
router.get("/posts/:postId", function(req, res){
  if (req.isAuthenticated()){

    const success = req.flash('success')
    const alert = (success || []).map((message) => {
      return {msg: message}
    });
    const requestedPostId = req.params.postId;
    Post.findOne({_id:requestedPostId}, function(err, post){
      console.log(post);
        res.render("post", {
          title: _.capitalize(post.title),
          content: post.content,
          isAuthenticated: req.isAuthenticated(),
          postId: post.id,
          updatedAt: post.updatedAt,
          alert: alert
        });
    });
  } else {
    res.redirect("/welcome");
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
          req.flash('success','Your message has been deleted');
          return res.redirect("/")
      }
    });
  } else {
    res.redirect("/welcome");
  }
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
  
// TODO: THIS MUST GO INTO helpers/dateHelper.js
// Export function as a module and then require in the beginning of this file so getDate() is available to use.


module.exports = router;  
