var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var clothsRouter = require('./routes/cloths');
var authRouter = require('./routes/auth');
var categoriesRouter = require('./routes/categories');
var sizesRouter = require('./routes/sizes');
var cartsRouter = require('./routes/carts');

var app = express();
mongoose.connect("mongodb://127.0.0.1:27017/ClothProjectNodejs").then(
  function(){
    console.log("connected");
  }).catch(
    function (error){
      console.log(error);
    }
  )

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/cloths', clothsRouter);
app.use('/auth', authRouter);
app.use('/categories', categoriesRouter);
app.use('/sizes', sizesRouter);
app.use('/carts', cartsRouter);

app.use(session({
  secret: 'aaaaaa',  // Thay 'your-secret-key' bằng một chuỗi bí mật của riêng bạn
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Đặt thành true nếu bạn đang ở chế độ production và sử dụng HTTPS
}));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
app.set('views', path.join(__dirname, 'views'));

// Setting the view engine to ejs
app.set('view engine', 'ejs');
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
var cors = require('cors');
app.use(cors());



module.exports = app;
