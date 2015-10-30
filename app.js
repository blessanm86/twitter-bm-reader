var express = require('express');
var path = require('path');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

var middlewares = {
  morgan:  require('./middlewares/morgan'),
  session: require('./middlewares/express-session'),
  favicon: require('./middlewares/serve-favicon'),
  cookie:  require('./middlewares/cookie-parser'),
  static:  require('./middlewares/static'),
  grant:  require('./middlewares/grant-express'),
  error: require('./middlewares/error')
};

var routers = {
  pageRouter: require('./routers/page'),
  apiRouter: require('./routers/api')
}

app.use(middlewares.morgan('dev'));
app.use(middlewares.session({secret:'very secret'}));
app.use(middlewares.favicon(path.join(__dirname ,'public/images/favicon.ico')));
app.use(middlewares.cookie());
app.use(middlewares.static(path.join(__dirname, 'public')));
app.use(middlewares.grant);


app.use(routers.pageRouter);
app.use(routers.apiRouter);

app.use(middlewares.error);

module.exports = app;
