function error(err, req, res, next) {
  //Catch all 404 errors
  var err = new Error('Not Found');
  err.status = 404;

  var err = req.app.get('env') === 'development' ? err : {};

  if(req.xhr || req.headers.accept.indexOf('json') >= 0) {
    var message = 'Internal Server Error';
    res.status(500).json({message});
  } else {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  }
};

module.exports = error;
