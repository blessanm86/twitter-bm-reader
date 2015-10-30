var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.redirect('/connect/twitter');
});

router.get('/twitter/authorised/', function (req, res) {
  // db('users').push({
  //   name: req.session.grant.response.raw.screen_name,
  //   accessToken: req.session.grant.response.access_token,
  //   accessSecret: req.session.grant.response.access_secret
  // });

  res.redirect('/'+ req.session.grant.response.raw.screen_name + '/');
});

//Checks if twitter session is set. Elese redirect for login.
router.use(function(req, res, next) {
  if(!req.session.grant) {
    res.redirect('/');
  } else {
    next();
  }
});

router.get('/:username/', function(req, res) {
  try {
    //res.render('home', { screen_name: req.session.grant.response.raw.screen_name });
    res.render('home');
  } catch(e) {
    res.redirect('/');
  }
});

module.exports = router;
