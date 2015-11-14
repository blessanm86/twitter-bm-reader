var Purest = require('purest');
var tweetToHTML = require('tweet-to-html');
var dbManager = require('./db-manager');

var grantConfig = require('../config/grant-oauth.json');


module.exports = {fetchProfile, fetchHomeTimeline};


function fetchProfile(username, condition) {
  var params = {path: 'users/show', condition};

  return fetchFromTwitter(username, params);
}


function fetchHomeTimeline(username, condition) {
  var params = {path: 'statuses/home_timeline', condition};

  return fetchFromTwitter(username, params).then(function(tweets){
    return Promise.resolve(tweetToHTML.parse(tweets));
  });
}


function fetchFromTwitter(username, params) {
  return dbManager.getUser(username)
    .then(function(dbUser) {
      return new Promise(function(resolve, reject) {
        params.tokens = dbUser;

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
          .request(function(err,res, response) {
            err ? reject(err) : resolve(response);
          });
      });
    });
}
