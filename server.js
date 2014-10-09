var app = require('./server-config.js');

var port = process.env.PORT || 4568;
var db = process.env.MONGODB || 'mongodb://localhost/shortly'
app.listen(port);
var mongoose = require('mongoose');

mongoose.connect(db);

console.log('Server now listening on port ' + port);
