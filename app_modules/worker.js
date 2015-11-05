var tweetToHTML = require('tweet-to-html');

var dbManager = require('./db-manager');

var twitterApi = require('./twitter-api');

var handlers = {
  'syncUser': syncUser,
  'syncUsers': syncUsers,
  getUser
};

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

function syncUsers() {
  dbManager.getUsers().forEach((user) => {
    updateUser(user);
  });
}

function updateUser(user) {

  var db = dbManager.getUser(user.username);

  var count = 50;
  var max_id = user.maxSyncedTweetId;
  twitterApi.fetchHomeTimeline(user.username, {count, max_id}, function(err,res, tweets) {
    if(err) {
      console.log(err);
    } else {//TODO
      _.find(tweets, {id_str: max_id});
    }
  });
}



function endWork(user) {
  process.send(user);
}
