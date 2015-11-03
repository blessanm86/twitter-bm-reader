var express = require('express');
var router = express.Router();
var dbManager = require('../app_modules/db-manager');
var workerManager = require('../app_modules/worker-manager');

router.get('/', function(req, res, next) {
  var username = req.cookies.username;
  var path = username ? `/${username}/` : '/connect/twitter/';

  res.redirect(path);
});

router.get('/twitter/authorised/', function (req, res) {
  var twitterResponse = req.session.grant.response;

  var jobData = {
    username: twitterResponse.raw.screen_name,
    accessToken: twitterResponse.access_token,
    accessSecret: twitterResponse.access_secret
  };

  //Ensure sync is run atleast once before redirection TODO.
  console.log('In Page');
  workerManager.addWork({jobName: 'syncUser', jobData}, function() {
    console.log('done');
    //res.redirect(`/${twitterResponse.raw.screen_name}/`);
  });
});

//Checks if twitter session is set. Elese redirect for login.
// router.use(function(req, res, next) {
//   if(!req.session.grant) {
//     res.redirect('/');
//   } else {
//     next();
//   }
// });

router.get('/:username/', function(req, res) {
  var username = req.params.username;
  var user = dbManager.getUser(username);

  if(user) {
    res.cookie('username', username, { maxAge: 1000*60 * 5, httpOnly: true })
    res.render('home');
  } else {
    res.redirect('/connect/twitter/');
  }
});

module.exports = router;
