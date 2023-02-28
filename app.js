//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const flash = require('connect-flash');

const rootRoutes = require("./routes/rootRoutes");
const loginRoutes = require("./routes/loginRoutes");
const registerRoutes = require("./routes/registerRoutes");
const postRoutes = require("./routes/postRoutes");


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
app.use('/', rootRoutes);
app.use('/', registerRoutes);
app.use('/', loginRoutes);
app.use('/', postRoutes);

const PORT = process.env.PORT || 3000
app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}`);
});