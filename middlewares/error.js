function error(req, res, next) {
  //Catch all 404 errors
  var err = new Error('Not Found');
  err.status = 404;

  var err = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
};

module.exports = error;
