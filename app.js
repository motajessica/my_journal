//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { check, validationResult } = require('express-validator')
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const { render } = require("express/lib/response");
const { isLength, reduceRight } = require("lodash");
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const flash = require('connect-flash');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "My Secret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const DB_URI = process.env.MONGODB_URI || "mongodb://0.0.0.0:27017/blogDB"
mongoose.connect(DB_URI, {useNewUrlParser: true}).then(() => {
  console.log("Connected to Database");
  }).catch((err) => {
      console.log("Not Connected to Database ERROR! ", err);
  });;

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

// Passport Google - Config Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/myjournal"
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile);
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));

//==================================//
// POSTS//
//==================================//
const postSchema = mongoose.Schema({
  title: String,
  content: String,
  userId: String
}, {timestamps: true});
const Post = mongoose.model("Post", postSchema);

// INDEX HOME
app.get("/", async function(req, res){
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
  };
});
app.get("/welcome", function(req, res){
  res.render("welcome", { isAuthenticated: req.isAuthenticated()}); 
});

// NEW
app.get("/compose", function(req, res){ 
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
app.post("/compose", function(req, res){
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
app.post("/posts/:postId/update", function(req, res){
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
app.get("/posts/:postId", function(req, res){
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
app.post("/posts/:postId", function(req, res){
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
  };
});

// EDIT 
app.get("/posts/:postId/edit", function(req, res){
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

//==================================//
// END OF POSTS//
//==================================//

app.get("/about", function(req, res){
  res.render("about", {
    isAuthenticated: req.isAuthenticated()
  });
});

app.get("/contact", function(req, res){
  res.render("contact", {
    isAuthenticated: req.isAuthenticated()
  });
});

//==================================//
// REGISTER  //
//=================================//
app.get ("/register", function(req, res){
  res.render("register", { isAuthenticated: req.isAuthenticated(), form: {}});
});
  
app.post("/register", urlencodedParser, [
  check("username", "Email is not valid")
    .isEmail()
    .normalizeEmail(), 
  check("password", "Password is not valid")
    .isLength({ min: 3})
], 
async (req, res)=> {
   
 const userExist = await User.exists({username: req.body.username});
 if (userExist) {
   const alert = [{msg: "This email has already in use"}]
   res.render('register', {alert, isAuthenticated: false, form: req.body});

  } else {
    User.register({username: req.body.username}, req.body.password, function(err, user){
      const errors = validationResult(req) 
      if(!errors.isEmpty()) {
          // return res.status(422).jsonp(errors.array())
          const alert = errors.array()
          const form = req.body
          res.render('register', {alert, isAuthenticated: false, form: req.body});
      } else {
        // const sucessMsg = [{msg: "Sucess, you can login now"}]
        passport.authenticate("local")(req, res, function(){
          res.redirect("/");
        });
      };
    });
  }
});

//==================================//
// LOGIN//
//==================================//
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get("/auth/google/myjournal", passport.authenticate("google", { failureRedirect: "/welcome" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
});

app.get("/login", function(req, res){
  const error = req.flash('error')
  const alert = (error || []).map((message) => {
    return {msg: message}
  });
    
  res.render("login", {alert, isAuthenticated: req.isAuthenticated()});
});

app.get("/logout", function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect("/");
  });
});

const authenticate =  passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Invalid username or password.',
  successRedirect: '/', 
  successFlash: 'Success login'
});

app.post("/login", authenticate, function(req, res){});

//==================================//
// END OF LOGIN//
//==================================//

const PORT = process.env.PORT || 3000
app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}`);
});

// FUNCTIONS TO GO INTO A HELPER MODULE
function getDate() {
  let today = new Date();
  let options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };
  return(today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }));
}