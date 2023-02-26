const {Post} = require("../models/post")
const _ = require("lodash");
const getDate = require('../helpers/dateHelper'); 
const { validationResult } = require('express-validator');

const index = async function(req, res) {
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
}; 

const compose = function(req, res) {
  if(req.isUnauthenticated()) {
    res.redirect("/")
  } else {
    res.render("posts/new", {
      isAuthenticated: req.isAuthenticated(),
      flash: {},
      title: null,
      content: null,
      id: null
    });
  };
}

const create = function(req, res) {
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
}

const show = function(req, res) {
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
}

const edit = function(req, res) {
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
}

const update = function(req, res) {
  if(req.isUnauthenticated()) {
    res.redirect("/")
  } else {
    const filter = {_id: req.body.id};
    const update = {title: req.body.title, content: req.body.content}
    Post.findOneAndUpdate(filter, update, function(err, post){
      if (err){
        res.render("/posts/edit");
      } else {
        req.flash('success','Your message has been edited!');
        res.redirect(`/posts/${post._id}`);
      };
    });
  };
}

const destroy = function(req, res) {
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
}

module.exports = {index, compose, create, show, edit, update, destroy} 