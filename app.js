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

//modularize - routes// 
const aboutRoutes = require("./routes/about");
const contactRoutes = require("./routes/contactRoutes");
const loginRoutes = require("./routes/loginRoutes");
const registerRoutes = require("./routes/registerRoutes");
const postRoutes = require("./routes/postRoutes");

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
app.use('/', registerRoutes);
app.use('/', aboutRoutes);
app.use('/', contactRoutes);
app.use('/', loginRoutes);
app.use('/', postRoutes);

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

// const User = new mongoose.model("User", userSchema);

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

//==================================//
// REGISTER  //
//=================================//
// app.get ("/register", function(req, res){
//   res.render("register", { isAuthenticated: req.isAuthenticated(), form: {}});
// });
  
// app.post("/register", urlencodedParser, [
//   check("username", "Email is not valid")
//     .isEmail()
//     .normalizeEmail(), 
//   check("password", "Password is not valid")
//     .isLength({ min: 3})
// ], 
// async (req, res)=> {
   
//  const userExist = await User.exists({username: req.body.username});
//  if (userExist) {
//    const alert = [{msg: "This email has already in use"}]
//    res.render('register', {alert, isAuthenticated: false, form: req.body});

//   } else {
//     User.register({username: req.body.username}, req.body.password, function(err, user){
//       const errors = validationResult(req) 
//       if(!errors.isEmpty()) {
//           // return res.status(422).jsonp(errors.array())
//           const alert = errors.array()
//           const form = req.body
//           res.render('register', {alert, isAuthenticated: false, form: req.body});
//       } else {
//         // const sucessMsg = [{msg: "Sucess, you can login now"}]
//         passport.authenticate("local")(req, res, function(){
//           res.redirect("/");
//         });
//       };
//     });
//   }
// });

//==================================//
// LOGIN//
//==================================//

const PORT = process.env.PORT || 3000
app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}`);
});

// FUNCTIONS TO GO INTO A HELPER MODULE