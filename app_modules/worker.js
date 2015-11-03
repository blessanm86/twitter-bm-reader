var tweetToHTML = require('tweet-to-html');

var dbManager = require('./db-manager');
var twitterApi = require('./twitter-api');

var handlers = {
  'syncUser': syncUser,
  'syncUsers': syncUsers
};

process.on('message', function(work) {console.log('I am from worker');
  handlers[work.jobName](work.jobData);
});

function syncUser(user) {
  dbManager.saveUser(user);

  var user = dbManager.getUser(user.username);

  var count = 50;
  var max_id = '';

  twitterApi.fetchHomeTimeline(user.username, {count}, function(err,res, tweets) {
    if(err) {
      console.log(err);
    } else {
      console.log(tweets[0].id_str);
      user.maxSyncedTweetId = tweets[0].id_str; //Need save????
      user.syncCount++;
      //user.tweets.concat(tweetToHTML.parse(tweets));
      dbManager.addTweets(tweetToHTML.parse(tweets));
      //dbManager.save();
      endWork();
    }
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



function endWork() {
  process.send('done');
}
