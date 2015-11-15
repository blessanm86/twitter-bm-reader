var pauseable = require('pauseable');
var _ = require('lodash');
var dbManager = require('./db-manager');
var twitterApi = require('./twitter-api');

function syncUser(user) {
  return new Promise((resolve, reject) => {
    var count = 50;
    var fetchedTweets = [];
    var latestSyncedTweetId = user.latestSyncedTweetId;

    function fetchUserTweets(condition) {
      return twitterApi.fetchHomeTimeline(user.username, condition)
        .then(function(tweets) {
          var maxTweetIndex = _.findIndex(tweets, (tweet) => {
            return tweet.id_str === user.latestSyncedTweetId;
          });

          if(maxTweetIndex >= 0) {
            tweets.splice(maxTweetIndex, tweets.length - maxTweetIndex);
            fetchedTweets = fetchedTweets.concat(tweets);

            //Save fetched tweets to db.
            console.log('Fetch Complete -> ',fetchedTweets.length);
            return dbManager.updateUser(user.username, fetchedTweets, false)
              .then(resolve);
          } else {
            fetchedTweets = fetchedTweets.concat(tweets);
            latestSyncedTweetId = tweets[tweets.length - 1].id_str;
            return fetchUserTweets({count, max_id: latestSyncedTweetId});
          }
        })
        .catch((err) => {
          console.log(err);

          //If fetchedTweets have any tweets save them to db.
          //This can happen if latestSyncedTweetId is very old. The api will only go back to a certain limit.
          //Some error happened like rate limit.
          if(fetchedTweets.length > 0) {
            console.log('Fetch Incomplete -> ',fetchedTweets.length);
            dbManager.updateUser(user.username, fetchedTweets, false)
              .then(resolve);
          } else {
            reject(err);
          }
        });
    }

    return fetchUserTweets({count})
      .then(() => {
        resolve();
      })
      .catch((err) => {
        console.log(err.stack);
      });
  });
}

module.exports = function() {
  var syncInterval = pauseable.setInterval(1000 * 60 * 5, function() {
    console.log('Scheduling sync');

    dbManager.getUsers()
      .then((users) => {
        return Promise.all(users.map(syncUser))
      })
      .then(() => {
        console.log('Synced');
      })
      .catch((err) => {

        //In case of error like rate limit, pause syncing for 30mins
        syncInterval.pause(1000 * 60 * 30);
      });
  });
}
