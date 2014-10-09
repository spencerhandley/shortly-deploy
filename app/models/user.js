var config = require('../config');
var mongoose = require('mongoose');

var User = mongoose.model("User", config.user)

module.exports = User;
