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

function getTweets(username) {
  dbManager.getUser(username, function(user) {
    endWork(user.tweets);
  });
}

function syncUsers() {
  dbManager.getUsers(function(users) {
    vasync.forEachPipeline({
      'func': syncUserTweets,
      'inputs': users
    }, function (err, results) {
      if(err) {
        endWork(false);
      } else {
        var response = results.successes[0];
        console.log(response.fetchedTweets.length);
        console.log(response.maxSyncedTweetId);
        endWork(true);
      }
    })
  });
}

function syncUserTweets(user, callback) {
  var count = 30;
  var fetchedTweets = [];
  var maxSyncedTweetId = user.maxSyncedTweetId;

  function fetchUserTweets(condition) {
    twitterApi.fetchHomeTimeline(user.username, condition, function(err,res, tweets) {

      if(err) {
        console.log(err);

        //If fetchedTweets have any tweets save them to db.
        //This can happen if maxSyncedTweetId is very old. The api will only go back to a certain limit.
        //Some error happened like rate limit.
        if(fetchedTweets.length > 0) {
          maxSyncedTweetId = fetchedTweets[0].id_str;
          user.maxSyncedTweetId = maxSyncedTweetId;
          user.tweets.unshift.apply(user.tweets, tweetToHTML.parse(fetchedTweets));

          dbManager.saveUser(user, function() {
            callback(null, {fetchedTweets, maxSyncedTweetId});
          });
        } else {
          callback(err);
        }
      } else {
        var maxTweetIndex = _.findIndex(tweets, (tweet) => {
          return tweet.id_str === user.maxSyncedTweetId;
        });

        if(maxTweetIndex >= 0) {
          tweets.splice(maxTweetIndex, tweets.length - maxTweetIndex);
          fetchedTweets = fetchedTweets.concat(tweets);

          //When no new tweet is there, the tweet with the max_id we sent comes back as response which gets removed in
          //above lines. In that case fetchedTweets is empty and dont do below step.
          if(fetchedTweets.length > 0) {
           maxSyncedTweetId = fetchedTweets[0].id_str;
          }

          //fetched all tweets. Now dump to database.
          user.maxSyncedTweetId = maxSyncedTweetId;
          user.tweets.unshift.apply(user.tweets, tweetToHTML.parse(fetchedTweets));

          dbManager.saveUser(user, function() {
            callback(null, {fetchedTweets, maxSyncedTweetId});
          });
        } else {
          fetchedTweets = fetchedTweets.concat(tweets);
          maxSyncedTweetId = tweets[tweets.length - 1].id_str;
          fetchUserTweets({count, max_id: maxSyncedTweetId});
        }
      }
    });
  }

  fetchUserTweets({count});
}

function endWork(user) {
  process.send(user);
}
