const mongoose = require('../config/db')
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const postSchema = mongoose.Schema({
    title: String,
    content: String,
    userId: String
  }, {timestamps: true});

const Post = mongoose.model("Post", postSchema);

module.exports = Post 