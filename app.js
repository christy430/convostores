
const express = require('express');
const dotenv=require('dotenv')
const createError = require('http-errors');
const session=require('express-session');
const path = require('path');

const cookieParser = require('cookie-parser');
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');

const app = express();
const port = 3000

dotenv.config()
//database connection
const connect=mongoose.connect('mongodb://127.0.0.1:27017/project');
connect 
.then(()=>{
  console.log("Mongodb server is connected");
})
.catch(()=>{
  console.log("Mongodb is not connected");
})

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set("views", "./views");
app.set('view engine', 'ejs');


app.use(
  session({
    secret:process.env.password,
    resave:false,
    saveUninitialized:true,
  })
);

app.use((req,res,next)=>{
  res.setHeader("Cache-Control","no-store,no-cache,must-revalidate,private");
  next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/adminassets')));
app.use(express.static(path.join(__dirname, "public/user")));

app.use('/admin', adminRouter);
app.use('/', usersRouter);

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




app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});


module.exports = app;