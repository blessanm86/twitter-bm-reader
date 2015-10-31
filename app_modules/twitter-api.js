var Purest = require('purest');

var grantConfig = require('../config/grant-oauth.json');

function fetchFromTwitter(req, res, params, callback) {

  try {
    var path = params.path;
    var condition = params.condition;
    var accessToken = params.tokens.accessToken;
    var accessSecret = params.tokens.accessSecret;
    var key = grantConfig.twitter.key;
    var secret = grantConfig.twitter.secret;
    var response = res;
    var twitter = new Purest({provider: 'twitter', key, secret});

    twitter.query()
      .select(path)
      .where(condition)
      .auth(accessToken, accessSecret)
      .request(callback);
  } catch(e) {
    console.log('ERRORED OUT');
    console.log(e);
  }

}

module.exports = fetchFromTwitter;
