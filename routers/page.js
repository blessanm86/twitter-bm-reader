var express = require('express');
var workerManager = require('../app_modules/worker-manager');

var router = express.Router();

router.get('/', function(req, res) {
  var username = req.cookies.username;
  var path = username ? `/${username}/` : '/connect/twitter/';

  res.redirect(path);
});

router.get('/twitter/authorised/', function (req, res) {
  var oathResponse = req.session.grant ? req.session.grant.response : null;

  if(oathResponse) {
    var jobData = {
      username: oathResponse.raw.screen_name,
      accessToken: oathResponse.access_token,
      accessSecret: oathResponse.access_secret
    };

    //Ensure sync is run atleast once before redirection TODO.
    workerManager.addWork({jobName: 'syncUser', jobData}, function() {
      res.redirect(`/${oathResponse.raw.screen_name}/`);
    });
  } else {
    res.redirect('/');
  }
});

router.get('/:username/', function(req, res) {
  var username = req.params.username;

  workerManager.addWork({jobName: 'getUser', jobData:{username}}, function(user) {
    if(user) {
      res.cookie('username', username, { maxAge: 1000*60 * 5, httpOnly: true })
      res.render('home');
    } else {
      res.redirect('/connect/twitter/');
    }
  });
});

module.exports = router;
