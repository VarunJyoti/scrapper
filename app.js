var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var scrapping = require('./routes/scrapping');
var cancelled = require('./routes/cancelled');
var diverted = require('./routes/diverted');
var rescheduled = require('./routes/rescheduled');
var apicache = require("apicache");
var index = require('./routes/index');

var app = express();
var cache = apicache.middleware;
 
app.use(cache('10 minutes'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

    //tell express to serve static files from the special
    //node variable __dirname which contains the current
    //folder
app.use(express.static(__dirname));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use("/", scrapping);
app.use("/", cancelled);
app.use("/", diverted);
app.use("/", rescheduled);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
