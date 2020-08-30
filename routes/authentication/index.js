module.exports = (connection, sqlOptions) => {
    const express = require('express');
    const router = express.Router();

    let session = require('express-session');
    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    const MySqlStore = require('express-mysql-session')(session);

    const userMethods = require('../../models/user/methods')(connection);

    const sessionStore = new MySqlStore(sqlOptions);

    const authenticationMiddleware = () => {
        return function (req, res, next) {
            if (req.isAuthenticated()) {
                return next()
            }
            res.send({ status: 401 });
        }
    }

    router.use(session({
        store: sessionStore,
        secret: 'Scaled Agile Framework',
        resave: false,
        saveUninitialized: true
    }));
    router.use(passport.initialize());
    router.use(passport.session());

    passport.use(new LocalStrategy({
        username: '',
        password: ''
    }, function (username, password, done) {
        userMethods.findUserByName(username, function (error, user) {
            if (error) {
                return done(error)
            }
            if (!user || password !== user['password']) {
                return done(null, false)
            }
            return done(null, user)
        })
    }));
    
    passport.serializeUser(function (user, done) {
        console.log('ser')
        done(null, JSON.stringify(user));
    });
    passport.deserializeUser(function (user, done) {
        console.log('des')
        try {
            done(null, JSON.parse(user));
        } catch (error) {
            done(error)
        }
    });

    router.get('/sessions', authenticationMiddleware(), function (req, res) {
        res.json({ status: 200, user: req.user })
    });
    
    router.post('/login', function (req, res, next) {
        passport.authenticate('local', {
            successRedirect: 'http://localhost:4200/admin',
            failureRedirect: 'http://localhost:4200/login',
            session: false
        }, (error, user) => {
            req.login(user, function (err) { })
            if (user) {
                res.send({ status: 200, user: user });
            } else {
                res.send({ status: 401, user: user });
            }
        })(req, res, next)
    });
    router.get('/logout', function (req, res) {
        req.logout();
        req.session.destroy();
        res.redirect('http://localhost:4200/login');
    });

    return router;
};