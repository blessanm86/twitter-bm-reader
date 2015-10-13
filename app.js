var express = require('express');
var session = require('express-session');
var Purest = require('purest');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var Grant = require('grant-express')
  , grant = new Grant(require('./config/grant-oauth.json'))

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
app.use('/users', users);

app.get('/twitter/authorised', function (req, res) {
  console.log(req.query)
  //var query = req.query;
  var query = req.session.grant.response;

  var key = require('./config/grant-oauth.json').twitter.key;
  var secret = require('./config/grant-oauth.json').twitter.secret;
  var twitter = new Purest({provider:'twitter', key:key, secret});
  var response = res;
  twitter.query()
  .select('statuses/home_timeline')
  .where({max_id:653949252633100288, count:2})
  .auth(query.access_token, query.access_secret)
  .request(function (err, res, body) {
    response.end(JSON.stringify(body, null, 2));
    //console.log(body);
  });

  //res.end(JSON.stringify(query, null, 2));
})

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
