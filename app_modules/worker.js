var tweetToHTML = require('tweet-to-html');

var dbManager = require('./db-manager');

var twitterApi = require('./twitter-api');

var handlers = { syncUser, getUser, getProfile, getTweets};

process.on('message', function(work) {
  handlers[work.jobName](work.jobData);
});

function getUser(userData) {
  dbManager.getUser(userData.username, function(user) {
    endWork(user);
  });
}

function syncUser(userData) {
  dbManager.saveUser(userData, function(user) {
    var count = 1;
    var max_id = '';

    twitterApi.fetchHomeTimeline(userData.username, {count}, function(err,res, tweets) {
      if(err) {
        console.log(err);
      } else {
        dbManager.getUser(userData.username, function(user) {
          user.maxSyncedTweetId = tweets[0].id_str;
          user.syncCount++;
          user.tweets = user.tweets.concat(tweetToHTML.parse(tweets));
          dbManager.saveUser(user, endWork);
        })
      }
    });
  });
}

function getProfile(data) {
  twitterApi.fetchProfile(data.username, data.condition, function(err,res, body) {
    endWork(body);
  });
}

function getTweets(data) {
  twitterApi.fetchHomeTimeline(data.username, data.condition, function(err,res, body) {
    endWork(body);
  });
}

function endWork(user) {
  process.send(user);
}
