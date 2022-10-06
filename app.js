//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Start Login added//
app.use(session({
  secret: "My Secret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
//Finish Login Added//

mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true});
// mongoose.set("useCreateIndex", true);

//Start Login added//
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//Finish Login Added//

const postSchema = {
  name: String,
  title: String,
  content: String
};
const Post = mongoose.model("Post", postSchema);

app.get("/", async function(req, res){
  //added for Login//
  if (req.isAuthenticated()){
  //Added for login//
  res.render("home", {
    startingContent: homeStartingContent,
    posts: await Post.find()
    });
  //added for login//
  } 
  // else {
  // redirect("login");
  //   }
  //aded for login//
});

//Start Login//
app.get("/login", function(req, res){
  res.render("login");
});

app.get ("/register", function(req, res){
  res.render("register");
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/login")
});

app.post("/register", function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/");
      });
    };
  });
});
app.post("/login", function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  
  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
      res.redirect("/");
    });
    };
  });
});
//Finish Login//

app.get("/compose", function(req, res){
  Post.find({}, function(err, posts){
   res.render("home", {
     startingContent: homeStartingContent,
     posts: posts
     });
 });
  res.render("compose");
});
app.post("/compose", function(req, res){
  console.log(req.body)
    const post = new Post ({
      title: req.body.postTitle,
      content: req.body.postBody
    });
  post.save(function(err){
     if (!err){
       res.redirect("/");
     }
   });
});
app.get("/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;
  Post.findOne({_id:requestedPostId}, function(err, post){
    console.log(post);
      res.render("post", {
        title: post.title,
        content: post.content
      });
  });
});
app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});
app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
