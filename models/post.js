const mongoose = require('../config/db')
const passportLocalMongoose = require("passport-local-mongoose");
const { check, validationResult } = require('express-validator');
const findOrCreate = require("mongoose-findorcreate");

const postSchema = mongoose.Schema({
    title: String,
    content: String,
    userId: String
  }, {timestamps: true});

const Post = mongoose.model("Post", postSchema);

const postValidations = [
  check("title", "Titles is required").not().isEmpty(),
]

module.exports = {Post, postValidations} 