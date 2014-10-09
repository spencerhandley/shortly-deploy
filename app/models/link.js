var config = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');


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
var Link = mongoose.model("Link", urlSchema)

module.exports = Link;
