var app = require('./server-config.js');

var port = process.env.PORT || 4568;

app.listen(port);
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/shortly');

console.log('Server now listening on port ' + port);
