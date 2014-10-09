var config = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    username: String,
    password: String
  })

  userSchema.methods = {

    initialize: function(){
      this.on('creating', this.hashPassword);
    }
  };
var User = mongoose.model("User", userSchema)

module.exports = User;
