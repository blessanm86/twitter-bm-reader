var vasync = require('vasync');
var _ = require('lodash');
var tweetToHTML = require('tweet-to-html');

var dbManager = require('./db-manager');

var twitterApi = require('./twitter-api');

var handlers = { syncUser, getUser, getProfile, getTweets, syncUsers};

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

function syncUsers() {
  dbManager.getUsers(function(users) {
    vasync.forEachParallel({
      'func': syncer,
      'inputs': users
    }, function (err, results) {
      if(!err) {
        console.log(results);
        endWork(users);
      }
    })
  });
}

function syncer(user, callback) {
  var maxId = user.maxSyncedTweetId;
  var temp = [];

  if(maxId) {
    function fetchTweets() {
      var count = 2;
      var max_id = maxId;
      console.log(max_id);
      twitterApi.fetchHomeTimeline(user.username, {count, max_id}, function(err,res, tweets) {

        if(tweets.length) {
          var index = _.findIndex(tweets, 'id_str', maxId);

          if(index > 0) {
            tweets.splice(index, tweets.length - index);
            user.maxSyncedTweetId = tweets[0].id_str;
            user.tweets = user.tweets.concat(temp, tweetToHTML.parse(tweets));
            dbManager.saveUser(user, function() {
              callback(user);
            });
          } else {
            temp = temp.concat(tweetToHTML.parse(tweets));
            console.log(tweets);
            maxId = tweets[tweets.length-1].id_str;
            fetchTweets();
          }
        } else {
          user.maxSyncedTweetId = maxId;
          user.tweets = user.tweets.concat(temp);
          dbManager.saveUser(user, function() {
            callback(user);
          });
        }
      });
    }

    fetchTweets();
  } else {
    count = 2;

    twitterApi.fetchHomeTimeline(user.username, {count}, function(err,res, tweets) {
      if(err) {
        console.log(err);
      } else {
       user.maxSyncedTweetId = tweets[0].id_str;
       user.syncCount++;
       user.tweets = user.tweets.concat(tweetToHTML.parse(tweets));
       dbManager.saveUser(user, function() {
         callback(user);
       });
      }
    });
  }
}

function endWork(user) {
  process.send(user);
}
