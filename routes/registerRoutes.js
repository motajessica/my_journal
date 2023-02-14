const express = require("express");
const bodyParser = require("body-parser");
const { check, validationResult } = require('express-validator')
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");
const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const findOrCreate = require("mongoose-findorcreate");

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


// // 

router.get ("/register", function(req, res){
    res.render("register", { isAuthenticated: req.isAuthenticated(), form: {}});
  });
    
  router.post("/register", urlencodedParser, [
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

module.exports = router;  