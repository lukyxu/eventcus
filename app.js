var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport')
require('dotenv').config()

var indexRouter = require('./routes/index');
var organizerRouter = require('./routes/organizer');

var port = process.env.PORT || '9000';

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize())

const uri = process.env.DB_CONNECTION;
mongoose.connect(uri, 
  {  useNewUrlParser: true,  useUnifiedTopology: true})
  .then(() => {  console.log('MongoDB Connected')})
  .catch(err => console.log(err))

app.use('/api', indexRouter);
app.use('/organizer', organizerRouter);

app.get('/hey', (req, res) => res.send('ho!'))

// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client/build')));
// if(process.env.NODE_ENV === 'production') {  
//   app.use(express.static(path.join(__dirname, 'client/build'))); 
//   app.get('*', (req, res) => {    
//     res.sendfile(path.join(__dirname = 'client/build/index.html'));  
// })}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
})
// app.listen(port, (req, res) => {  console.log( `server listening on port: ${port}`);})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
