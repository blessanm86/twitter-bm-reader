var Purest = require('purest');
var dbManager = require('./db-manager');

var grantConfig = require('../config/grant-oauth.json');


module.exports.fetchProfile = fetchProfile;
module.exports.fetchHomeTimeline = fetchHomeTimeline;


function fetchProfile(username, condition, callback) {
  var params = {path: 'users/show', condition};

  fetchFromTwitter(username, params, callback);
}


function fetchHomeTimeline(username, condition, callback) {
  var params = {path: 'statuses/home_timeline', condition};

  fetchFromTwitter(username, params, callback);
}


function fetchFromTwitter(username, params, callback) {
  try {
    params.tokens = getUserTokens(username);

    var path = params.path;
    var condition = params.condition;
    var accessToken = params.tokens.accessToken;
    var accessSecret = params.tokens.accessSecret;
    var key = grantConfig.twitter.key;
    var secret = grantConfig.twitter.secret;

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

function getUserTokens(username) {
  return dbManager.getUser(username);
}
