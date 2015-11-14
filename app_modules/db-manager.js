function DbManager() {
  var TingoDb = require('tingodb')().Db;
  var db = new TingoDb('./database', {});
  var collection = db.collection('users');

  this.getUser = (username) => {
    return new Promise(function(resolve, reject) {
      collection.findOne({username}, function(err, result) {
        err ? reject(err) : resolve(result);
      });
    });
  };

  this.saveUser = (user) => {
    var condition = {username: user.username};

    return this.getUser(user.username).then(function(dbUser) {
      if(dbUser) {
        dbUser.accessToken = user.accessToken;
        dbUser.accessSecret = user.accessSecret;
      } else {
        dbUser = user;
      }

      return new Promise(function(resolve, reject) {
        collection.update(condition, dbUser, {upsert: true, w: 2}, function(err, result, status) {
          err ? reject(err) : resolve(result);
        });
      });
    });
  };

  this.updateUser = (username, tweets) => {
    return this.getUser(username).then(function(dbUser) {
      dbUser.latestSyncedTweetId = tweets[0].id_str;
      dbUser.tweets.unshift.apply(dbUser.tweets, tweets);

      return new Promise(function(resolve, reject) {
        collection.update({username}, dbUser, {upsert: false, w: 2}, function(err, result, status) {
          err ? reject(err) : resolve(result);
        });
      });
    });
  };

  this.getUsers = () => {
    return new Promise(function(resolve, reject) {
      usersCollection.find().toArray(function(err, users) {
        err ? reject(err) : resolve(result);
      });
    });
  }
}

module.exports = new DbManager();
