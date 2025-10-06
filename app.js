var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var cartRouter = require("./routes/cart");
var kassaRouter = require("./routes/kassa");
var adminRouter = require("./routes/admin");
var adminNewProductRouter = require("./routes/newProduct");
const expressLayouts = require('express-ejs-layouts');


var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(expressLayouts);
app.set('layout', 'layout');
const session = require('express-session');

app.use(session({
  secret: 'your_secret_key', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static('public'));
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/", cartRouter);
app.use('/', kassaRouter);
app.use("/admin", adminRouter);
app.use("/admin", adminNewProductRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// ask
module.exports = app;
