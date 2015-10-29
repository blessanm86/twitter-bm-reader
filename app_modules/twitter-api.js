var Purest = require('purest');

var grantConfig = require('../config/grant-oauth.json');

function fetchFromTwitter(req, res, params, callback) {

  //If session expires code will fail as no token is available. Then redirect to root to initiate authorisation
  try {
    params = params();

    var path = params.path;
    var condition = params.condition;
    var access_token = req.session.grant.response.access_token;
    var access_secret = req.session.grant.response.access_secret;
    var key = grantConfig.twitter.key;
    var secret = grantConfig.twitter.secret;
    var response = res;
    var twitter = new Purest({provider:'twitter', key: key, secret});

    twitter.query()
      .select(path)
      .where(condition)
      .auth(access_token, access_secret)
      .request(callback);
  } catch(e) {
    console.log('ERRORED OUT');
    console.log(e);
  }

}

module.exports = fetchFromTwitter;
