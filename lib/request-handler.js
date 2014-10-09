var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');
var Promise = require('bluebird');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find(function(err, links) {
    res.send(200, links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.find({ url: uri }, function(err, found) {
    if (found.length > 0) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        generateCode(uri, function(hashCode){
          var link = new Link({
            url: uri,
            title: title,
            code: hashCode,
            visits: 0,
            base_url: req.headers.origin
          });

          link.save(function(err, newLink) {
            res.send(200, newLink);
          });
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  console.log(username)
  User.find({ username: username }, function(err, user) {
    console.log(user)
      if (!user) {
        res.redirect('/login');
      } else {
        comparePassword(password, user[0].password, function(match) {
          if (match) {
            console.log('match')
            util.createSession(req, res, user);
          } else {
            console.log('no match')
            res.redirect('/login');
          }
        })
      }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({ username: username }, function(err, user) {
    console.log(user)
      if (user.length === 0) {
        hashPassword(password, function(pass){
          var newUser = new User({
            username: username,
            password: pass
          });
          newUser.save(function(err, newUser) {
            util.createSession(req, res, newUser);
          });
        });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    })
};

exports.navToLink = function(req, res) {
  Link.find({ code: req.params[0] }, function(err,link) {
    if (link.length === 0) {
      res.redirect('/');
    } else {
      console.log(link[0])
      Link.findByIdAndUpdate({_id: link[0].id}, {$inc: {visits:1}}, function(){
        return res.redirect(link[0].url);
      })
    }
  });
};
var hashPassword = function(password, callback){
  var cipher = Promise.promisify(bcrypt.hash);
  cipher(password, null, null).bind(this)
    .then(function(hash) {
      callback(hash)
    });
}

var comparePassword = function(attemptedPassword, userHash, callback) {
  bcrypt.compare(attemptedPassword, userHash, function(err, isMatch) {
    callback(isMatch);
  });
}

var generateCode=  function(url, callback){
  var shasum = crypto.createHash('sha1');
  shasum.update(url);
  callback(shasum.digest('hex').slice(0, 5));
};
