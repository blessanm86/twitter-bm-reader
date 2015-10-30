var Grant = require('grant-express');
var grantConfig = require('../config/grant-oauth.json');

module.exports = new Grant(grantConfig);
