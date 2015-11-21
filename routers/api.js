var express = require('express');
var dbManager = require('../app_modules/db-manager');
var twitterApi = require('../app_modules/twitter-api');

var router = express.Router();

router.get('/:username/profile/', dbCheck, (req, res, next) => {
  var username = req.params.username;
  var condition = {screen_name: username};

  twitterApi.fetchProfile(username, condition)
    .then((profile) => {
      res.status(200).json(profile);
    })
    .catch((err) => {
      next(err);
    });;
});

router.get('/:username/tweets/', dbCheck, (req, res, next) => {
  var response = res;
  var username = req.params.username;

  //Take last 50 elements and reverse to make sure old tweets are shown first.
  var tweets = req.user.tweets.splice(-50).reverse();

  dbManager.updateUser(username, req.user.tweets, true)
    .then(() => {
      response.status(200).json({tweets, remainingCount:req.user.tweets.length});
    })
    .catch((err) => {
      next(err);
    });
});


function dbCheck(req, res, next) {
  var username = req.params.username;

  dbManager.getUser(username)
    .then((user) => {
      req.user = user;

      var err = new Error('Unauthorized User');
      err.status = 401;
      user? next() : next(err);
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = router;
