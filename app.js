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
var restfullRoute = require('./routes/RESTfulRoute');

var userAPI = require('./API/userAPI');
var permissionAPI = require('./API/permissionAPI')
var _ = require('underscore');

var app = express();


passport.use('local', new passportLocal({
        passReqToCallback: true,
        usernameField: 'userName',
        passwordField: 'password'
    },
    function(req, username, password, verified) {
        async.waterfall([
            function(cb) {
                userAPI.login(username, password, req.ip, cb);
            },
            function(data, cb) {
                if (data && data[0] && data[0].cacheId != '') {
                    permissionAPI.getOwnPermission(data[0].userId, function(err, pers) {
                        if (err) {
                            cb('Can\'t get permissions.', null);
                        } else {
                            cb(null, {
                                userId: data[0].userId,
                                cacheId: data[0].cacheId,
                                permissions: _.map(pers, function(v, i) {
                                    return v.PermissionId
                                }),
                                isNeedForceModify: data[0].isNeedForceModify
                            });
                        }
                    })
                } else {
                    cb('No such user.', null);
                }
            }
        ], function(err, data) {
            if (data && data.cacheId != '') {
                verified(err, data, null);
            } else {
                verified(null, null, 'Wrong login name or wrong password.');
            }
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
    secret: 'Just kidding you',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 10 * 60 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));



passport.serializeUser(function(user, done) {
    done(null, JSON.stringify(user));
});

passport.deserializeUser(function(id, done) {
    done(null, id);
});


app.use('/', freeRoutes);



app.use('/API/user/LOGIN', passport.authenticate('local', function(req, res, data, info) {
    if (arguments.length == 4) {
        res.cookie('userInfo', JSON.stringify({
            loginName: req.body.userName,
            userId: data.userId,
            permissions: data.permissions
        }));

        req.logIn(
            data,
            function() {

                res.writeHead(200);
                res.write(JSON.stringify({
                    isLoginIn: true,
                    isNeedForceModify: data.isNeedForceModify
                }));

                res.end();

            });

    } else {
        res.writeHead(200);
        res.write(JSON.stringify({
            isLoginIn: false
        }));
        res.end();
    }

}));



app.use('/', function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
});

app.use('/', routes);
app.use('/API', apiRoute);
app.use('/restfulAPI', restfullRoute);


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