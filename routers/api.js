var express = require('express');
var dbManager = require('../app_modules/db-manager');
var twitterApi = require('../app_modules/twitter-api');

var router = express.Router();

router.get('/:username/profile/', dbCheck, function(req, res) {
  var username = req.params.username;
  var condition = {screen_name: username};

  twitterApi.fetchProfile(username, condition)
    .then(function(profile) {
      res.status(200).json(profile);
    });
});

router.get('/:username/tweets/', dbCheck, function(req, res) {
  var response = res;
  var username = req.params.username;

  response.status(200).json(req.user.tweets);
});


function dbCheck(req, res, next) {
  var username = req.params.username; console.log(req.params);

  dbManager.getUser(username)
    .then(function(user) {
      req.user = user;

      user? next() : next(new Error('Invalid User'));
    })
    .catch(function(err) {
      console.log('PROMISE FAILED');
      console.error(err.stack);
    });
}

module.exports = router;
