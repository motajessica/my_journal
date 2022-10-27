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

const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const { render } = require("express/lib/response");


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

mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true});

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


// INDEX
app.get("/", async function(req, res){
  if (req.isAuthenticated()){
    let posts = await Post.find({userId: req.user.id})
    posts.forEach(function(post){
      post.title = _.capitalize(post.title)
    })
    res.render("home",{
      posts: posts.reverse(),
      isAuthenticated: req.isAuthenticated(),
      today: getDate(),
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
         res.redirect("/");
       }
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
        res.redirect(`/posts/${post._id}`);
      }
    });
  };
});

// SHOW
app.get("/posts/:postId", function(req, res){
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
          isAuthenticated: req.isAuthenticated()
        });
      } else { 
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

app.get("/about", function(req, res){
  res.render("about", {
    aboutContent: aboutContent, 
    isAuthenticated: req.isAuthenticated()
  });
});

app.get("/contact", function(req, res){
  res.render("contact", {
    contactContent: contactContent,
    isAuthenticated: req.isAuthenticated()
  });
});

//==================================//
// END OF POSTS//
//==================================//


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
  }
);

app.get("/login", function(req, res){
  res.render("login", { isAuthenticated: req.isAuthenticated()});

});
app.get ("/register", function(req, res){
  res.render("register", { isAuthenticated: req.isAuthenticated()});
});

app.get("/logout", function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect("/");
  });
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
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, function(){
      res.redirect("/");
    });
    };
  });
});
//==================================//
// END OF LOGIN//
//==================================//

app.listen(3000, function() {
  console.log("Server started on port 3000");
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