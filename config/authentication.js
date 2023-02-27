const passport = require("passport");

const initializeGoogleStrategy = passport.authenticate("google", { scope: ["profile"] });
const googleStrategy = passport.authenticate("google", { failureRedirect: "/" }) 
const localStrategy =  passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Invalid username or password!',
  successRedirect: '/posts', 
  successFlash: 'Success login'
});
passport.authenticate
module.export = {passport}