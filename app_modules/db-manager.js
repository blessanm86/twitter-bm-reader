function DbManager() {
  var TingoDb = require('tingodb')().Db;
  var db = new TingoDb('./database', {});
  var collection = db.collection('users');

  this.getUser = (username) => {
    return new Promise((resolve, reject) => {
      collection.findOne({username}, (err, result) => {
        err ? reject(err) : resolve(result);
      });
    });
  };

  this.saveUser = (user) => {
    var condition = {username: user.username};

    return this.getUser(user.username).then((dbUser) => {
      if(dbUser) {
        dbUser.accessToken = user.accessToken;
        dbUser.accessSecret = user.accessSecret;
      } else {
        dbUser = user;
      }

      return new Promise((resolve, reject) => {
        collection.update(condition, dbUser, {upsert: true, w: 2}, (err, result, status) => {
          err ? reject(err) : resolve(result);
        });
      });
    });
  };

  this.updateUser = (username, tweets, isReplace) => {
    return this.getUser(username).then((dbUser) => {

      //if tweets is an empty array, retain the latestSyncedTweetId and dont try to overwrite it.
      //tweets array may become empty when all the tweets in the db are sent to client.
      if(tweets.length) {
        dbUser.latestSyncedTweetId = tweets[0].id_str;
      }

      //When authorisaction(/twitter/authorised), we want to add the latest tweets to existing tweets
      //For other operations we replace the tweets array with the passed in tweets.
      if(isReplace) {
        dbUser.tweets = tweets;
      } else {
        dbUser.tweets.unshift.apply(dbUser.tweets, tweets);
      }

      return new Promise((resolve, reject) => {
        collection.update({username}, dbUser, {upsert: false, w: 2}, (err, result, status) => {
          err ? reject(err) : resolve(result);
        });
      });
    });
  };

  this.getUsers = () => {
    return new Promise((resolve, reject) => {
      collection.find().toArray((err, users) => {
        err ? reject(err) : resolve(users);
      });
    });
  }
}

module.exports = new DbManager();
