var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var twitter = require('./app_modules/twitter-api');

var Grant = require('grant-express');
var grantConfig = require('./config/grant-oauth.json');

var grant = new Grant(grantConfig);

var app = express();

app.use(session({secret:'very secret'}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(grant);

app.use('/', routes);

app.get('/twitter/authorised/', function (req, res) {
  res.redirect('/'+ req.session.grant.response.raw.screen_name + '/');
});

app.get('/:username/', function(req, res) {
  try {
    res.render('home', { screen_name: req.session.grant.response.raw.screen_name });
  } catch(e) {
    res.redirect('/');
  }
});

//api to fetch profile information
app.get('/:username/profile/', function(req, res) {
  var response = res;

  twitter(req, res, function() {
    return {
      path: 'users/show',
      condition: {screen_name: req.session.grant.response.raw.screen_name}
    }
  }, function(err,res, body) {
    response.status(200).json(body);
  });
});

//api to tweets
app.get('/:username/tweets/', function(req, res) {
  var response = res;

  twitter(req, res, function() {
    return {
      path: 'statuses/home_timeline',
      condition: {count:2}
    }
  }, function(err,res, body) {
    response.status(200).json(body);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
