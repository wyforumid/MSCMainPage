var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var passportLocal = require('passport-local').Strategy;
var async = require('async');

var routes = require('./routes/index');
var freeRoutes = require('./routes/freeRoute');
var apiRoute = require('./routes/apiRoute');
var userAPI = require('./API/userAPI');

var app = express();


passport.use('local', new passportLocal({
    passReqToCallback : true,
    usernameField : 'userName',
    passwordField : 'password'
},
function(req,username,password,verified){
    async.waterfall([
        function(cb){
            userAPI.login(username,password,req.ip,cb);
        }
    ],function(err,data){
        verified(err,data,null);
    });
}));



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
    secret:'Just kidding you',
    resave:true,
    saveUninitialized:true,
    cookie:{
        maxAge: 10 * 60 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', freeRoutes);
app.use('/API/user/LOGIN',passport.authenticate('local'))
app.use('/',function(req,res,next){
    if(req.isAuthenticated()){
        next();
    }

    res.redirect('/');
});
app.use('/main', routes);
app.use('/API', apiRoute);



/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;