var config = require('../config');
var mongoose = require('mongoose');

var Link = mongoose.model("Link", config.url)

module.exports = Link;
