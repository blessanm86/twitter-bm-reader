var express = require('express');
var path = require('path');

var workerManager = require('./app_modules/worker-manager');

setInterval(function() {
  console.log('Scheduling sync');

  workerManager.addWork({jobName: 'syncUsers'}, function() {
    console.log('Sync Complete');
  });
}, 1000 * 5);

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

var middlewares = {
  morgan:  require('./middlewares/morgan'),
  cookie:  require('./middlewares/cookie-parser'),
  session: require('./middlewares/express-session'),
  favicon: require('./middlewares/serve-favicon'),
  static:  require('./middlewares/static'),
  grant:  require('./middlewares/grant-express'),
  error: require('./middlewares/error')
};

var routers = {
  pageRouter: require('./routers/page'),
  apiRouter: require('./routers/api')
}

app.use(middlewares.morgan('dev'));
app.use(middlewares.cookie());
app.use(middlewares.session({secret:'very secret'}));
app.use(middlewares.favicon(path.join(__dirname ,'public/images/favicon.ico')));
app.use(middlewares.static(path.join(__dirname, 'public')));
app.use(middlewares.grant);


app.use(routers.pageRouter);
app.use(routers.apiRouter);

app.use(middlewares.error);

module.exports = app;
