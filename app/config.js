var crypto = require('crypto');
var Promise = require('bluebird');
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/shortly');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {

  var urlSchema = mongoose.Schema({
    url: String,
    base_url: String,
    code: String,
    title: String,
    visits: Number,

  });

  urlSchema.methods = {
    initialize: function(){
      this.on('creating', function(model, attrs, options){
        var shasum = crypto.createHash('sha1');
        shasum.update(model.get('url'));
        model.set('code', shasum.digest('hex').slice(0, 5));
      });
    }
  };


  var userSchema = mongoose.schema({
    username: String,
    password: String
  })

  userSchema.methods = {
    comparePassword: function(attemptedPassword, callback) {
      bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
        callback(isMatch);
      });
    },
    hashPassword: function(){
      var cipher = Promise.promisify(bcrypt.hash);
      return cipher(this.get('password'), null, null).bind(this)
        .then(function(hash) {
          this.set('password', hash);
        });
    },
    initialize: function(){
      this.on('creating', this.hashPassword);
    }
  };
  module.exports.url = urlSchema
  module.exports.user = userSchema
});




