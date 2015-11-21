var express = require('express');
var twitterApi = require('../app_modules/twitter-api');
var dbManager = require('../app_modules/db-manager');
var whiteList = require('../config/white-list.json');

var router = express.Router();

router.get('/', (req, res) => {
  var username = req.cookies.username;
  var path = username ? `/${username}/` : '/connect/twitter/';

  res.redirect(path);
});

router.get('/twitter/authorised/', (req, res) => {
  var oathResponse = req.session.grant ? req.session.grant.response : null;

  if(oathResponse) {
    var username = oathResponse.raw.screen_name;
    var user = {
      tweets: [],
      username,
      accessToken: oathResponse.access_token,
      accessSecret: oathResponse.access_secret
    };

    //Check if user is in whitelist. Only let white listed users use this app.
    if(whiteList.indexOf(username) < 0) {
      response.status(403).json({message:
          "You're username is not in the whitelist. Please host this app on your own server for your personal use."});
    } else {
      dbManager.saveUser(user)
        .then((response) => {
          return twitterApi.fetchHomeTimeline(username, {count: 50});
        })
        .then((tweets) => {
          return dbManager.updateUser(username, tweets, false);
        })
        .then((response) => {
          res.redirect(`/${username}/`);
        })
        .catch((err) => {
          console.log('PROMISE FAILED');
          console.error(err.stack);
        });
    }
  } else {
    res.redirect('/');
  }
});

router.get('/:username/', (req, res) => {
  var username = req.params.username;

  dbManager.getUser(username)
    .then((user) => {
      if(user) {
      res.cookie('username', username, { maxAge: 1000*60 * 5, httpOnly: true })
      res.render('home');
      } else {
        res.redirect('/connect/twitter/');
      }
    })
    .catch((err) => {
      console.log('PROMISE FAILED');
      console.error(err.stack);
    });
});

module.exports = router;
