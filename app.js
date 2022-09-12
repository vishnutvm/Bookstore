const createError = require('http-errors');
const express = require('express');
const path = require('path');
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser');
const session = require('express-session')

const logger = require('morgan');

const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
const db = require('./config/connections')

const app = express();
const fileUpload= require('express-fileupload')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials'}))


// parsin the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// cookie parser middleware
app.use(cookieParser());
app.use(fileUpload())

const oneDay = 1000 * 60 * 60 * 24
app.use(session({
  secret:'key',
  saveUninitialized:true,
  cookie:{maxAge:oneDay},
  resave:false
}))

// serving public file
app.use(express.static(path.join(__dirname, 'public')));


// database connecting
db.connect((err)=>{
  if(err) console.log(err)
  else  
  console.log("Database connected")
})

// routs
app.use('/', usersRouter);
app.use('/admin', adminRouter);


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
