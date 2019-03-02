const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MySqlStore = require('express-mysql-session')(session);
const cors = require('cors');
const authController = require('./authorization');
const sqlOptions = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'kanban_board'
}
const connection = mysql.createConnection(sqlOptions);
const sessionStore = new MySqlStore(sqlOptions);
const router = require('./routes')(connection, sqlOptions);
const userMethods = require('./models/user/methods')(connection);
const authenticationMiddleware = () => {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.send({ status: 401 });
    }
};

app = express();

app.listen(3000);
app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser());
app.use(session({
    store: sessionStore,
    secret: 'Scaled Agile Framework',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    let origin = req.headers.origin;
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Origin, Authorization, Accept, Client-Security-Token, Accept-Encoding");
    next();
});
app.use(router);

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
        console.log(user)
        if (user && user['is_initialPassword'] === 1) {
            return done(null, user, 406)
        }
        return done(null, user)
    })
}));

passport.serializeUser(function (user, done) {
    console.log('serialized');
    done(null, JSON.stringify(user));
});
passport.deserializeUser(function (user, done) {
    try {
        done(null, JSON.parse(user));
    } catch (error) {
        done(error)
    }
});
app.get('/sessions', authenticationMiddleware(), function (req, res) {
    res.json({ status: 200, user: req.user })
});
app.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: 'http://localhost:4200/admin',
        failureRedirect: 'http://localhost:4200/login',
        session: false
    }, (error, user, code) => {
        console.log(code)
        if (user) {
            if (code === 406) {
                res.send({ status: 406, user: user });
            } else {
                req.login(user, function (err) { })
                res.send({ status: 200, user: user });
            }
        } else {
            res.send({ status: 401, user: user });
        }
    })(req, res, next)
});
app.get('/logout', function (req, res) {
    req.logout();
    req.session.destroy();
    res.redirect('http://localhost:4200/login');
})