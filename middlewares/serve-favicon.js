var favicon = require('serve-favicon');
var path = require('path');

module.exports = favicon(path.join(__dirname + './../public/images/favicon.ico'));
