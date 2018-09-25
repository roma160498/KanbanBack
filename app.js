let express = require('express');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let mysql = require('mysql');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let RedisStore = require('connect-redis')(session);
let MySqlStore = require('express-mysql-session')(session);

let cors = require('cors');
let authController = require('./authorization');

let sqlOptions = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'kanban_board'
}
let connection = mysql.createConnection(sqlOptions);
let sessionStore = new MySqlStore(sqlOptions);
app = express();
app.listen(3000, function () {
    console.log("ajntgtrg");
})
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
    console.log(origin)
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Origin, Authorization, Accept, Client-Security-Token, Accept-Encoding");
    next();
});
function getRole(callback, properties, amount, offset, isCount, name) {
    let propString = properties ? properties.join(',') : '*';
    propString = isCount ? `COUNT(${propString}) as sum` : propString;
    let amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
    let offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
    let whereStatement = name !== 'undefined' && name ? ` where name='${name}'` : '';
    console.log(`SELECT ${propString} from role ${amountParam} ${offsetParam} ${whereStatement}`);
    connection.query(`SELECT ${propString} from role ${amountParam} ${offsetParam} ${whereStatement}`, function (error, results, fields) {
        if (error) {
            return error;
        }
        console.log(results)
        return callback(results);
    });
}
function findUserByName(username, callback) {
    connection.query('SELECT * from user where login="' + username + '"', function (error, results, fields) {
        if (error) {
            return callback(error);
        }
        return results[0] ? callback(null, results[0]) : callback(null);
    });
}
function deleteUser(callback, id) {
    connection.query(`DELETE from user where id="${id}"`, function (error, results, fields) {
        if (error) {
            return error;
        }
        return callback(results);
    });
}
function insertUser(callback, user) {
    connection.query(`INSERT INTO user (login, password, name, surname, email) Values ("${user['login']}", "${user['password']}", "${user['name']}", "${user['surname']}", "${user['email']}")`, function (error, results, fields) {
        //console.log(error)
        if (error) {
            return callback(null, error);
        }
        return callback(results);
    });
}
function updateUser(callback, id, user) {
    let statementsString = '';
    for (let key of Object.keys(user)) {
        console.log(key)
        console.log(user[key])
        console.log("'" + key + "'=" + user[key] + ",")
        statementsString += `${key}='${user[key]}',`
        console.log(statementsString)
    }
    statementsString = statementsString.slice(0, -1)
    console.log(`UPDATE user SET ${statementsString} where 'id'='${id}'`)
    connection.query(`UPDATE user SET ${statementsString} where id='${id}'`, function (error, results, fields) {
        if (error) {
            return callback(null, error);
        }
        return callback(results);
    });
}
function getUsers(callback, properties, amount, offset, isCount) {
    let propString = properties ? properties.join(',') : '*';
    propString = isCount ? `COUNT(${propString}) as sum` : propString;
    let amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
    let offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
    //console.log(`SELECT ${propString} from user ${amountParam} ${offsetParam}`)
    connection.query(`SELECT ${propString} from user ${amountParam} ${offsetParam}`, function (error, results, fields) {
        //console.log(results)
        if (error) {
            return error;
        }
        return callback(results);
    });
}
function getUsersOfTeam(callback, teamId, properties, amount, offset, isCount) {
    let propString = properties ? properties.join(',') : '*';
    propString = isCount ? `COUNT(${propString}) as sum` : propString;
    let amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
    let offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
    connection.query(`SELECT user.id, user.name, user.surname, user.login, user.email, role.name as roleName from user
    inner join team_user
    on team_user.user_id = user.id 
    inner join team
    on team.id = team_user.team_id
    inner join role
    on team_user.role_id = role.id where team.id = ${teamId} 
    ${amountParam} ${offsetParam}`, function (error, results, fields) {
            console.log(error);
            if (error) {
                return error;
            }
            return callback(results);
        });
}
function deleteUserFromTeam(callback, teamId, userId) {
    console.log(`DELETE from team_user where user_id="${userId}" and team_id="${teamId}"`);
    connection.query(`DELETE from team_user where user_id="${userId}" and team_id="${teamId}"`, function (error, results, fields) {
        if (error) {
            return error;
        }
        return callback(results);
    });
}
function insertUsersOfTeam(callback, teamId, users) {

    getRole(function (roles) {
        let values = '';
        for (let user of users) {
            let roleId = roles.filter((el => el.name === user.roleName))[0].id;
            values += ` ("${teamId}", "${user['id']}", "${roleId}"),`
        }
        values = values.slice(0, -1)
            console.log(`INSERT INTO team_user (team_id, user_id, role_id) Values${values}`)
            connection.query(`INSERT INTO team_user (team_id, user_id, role_id) Values${values}`, function (error, results, fields) {
                //console.log(error)
                if (error) {
                    return callback(null, error);
                }
                return callback(results);
            });
        }, null, 'undefined', 'undefined', false)

}
function getTeams(callback, properties, amount, offset, isCount) {
    let propString = properties ? properties.join(',') : '*';
    propString = isCount ? `COUNT(${propString}) as sum` : propString;
    let amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
    let offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
    connection.query(`SELECT ${propString} from team ${amountParam} ${offsetParam}`, function (error, results, fields) {
        if (error) {
            return error;
        }
        return callback(results);
    });
}
function deleteTeam(callback, id) {
    connection.query(`DELETE from team where id="${id}"`, function (error, results, fields) {
        if (error) {
            return error;
        }
        return callback(results);
    });
}
function insertTeam(callback, team) {
    connection.query(`INSERT INTO team (name) Values ("${team['name']}")`, function (error, results, fields) {
        //console.log(error)
        if (error) {
            return callback(null, error);
        }
        return callback(results);
    });
}
function updateUsersOfTeam(callback, teamId, userId, item) {
    getRole(function (roleObj) {
        connection.query(`UPDATE team_user SET role_id='${roleObj[0].id}' where team_id='${teamId}' and user_id='${userId}'`, function (error, results, fields) {
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    }, null, 'undefined', 'undefined', false, item['roleName'])
}
function updateTeam(callback, id, team) {
    let statementsString = '';
    for (let key of Object.keys(team)) {
        statementsString += `${key}='${team[key]}',`
    }
    statementsString = statementsString.slice(0, -1)
    connection.query(`UPDATE team SET ${statementsString} where id='${id}'`, function (error, results, fields) {
        if (error) {
            return callback(null, error);
        }
        return callback(results);
    });
}
passport.use(new LocalStrategy({
    username: '',
    password: ''
}, function (username, password, done) {

    findUserByName(username, function (error, user) {
        console.log(11)
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
    console.log('serialized');
    done(null, JSON.stringify(user));
});
passport.deserializeUser(function (user, done) {
    try {
        console.log(user);
        done(null, JSON.parse(user));
    } catch (error) {
        done(error)
    }
});

app.get('/sessions', authenticationMiddleware(), function (req, res) {
    res.json({ status: 200 })
});

app.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: 'http://localhost:4200/admin',
        failureRedirect: 'http://localhost:4200/login',
        session: false
    }, (error, user) => {
        console.log(user)
        req.login(user, function (err) { })
        //res.cookie('cookiename', 'cookievalue');
        if (user)
            res.send({ status: 200, user: user });
        else
            res.send({ status: 401, user: user });
        //res.header("Access-Control-Allow-Origin", 'http://localhost:4200');
        // res.header.origin = 'http://localhost:4200';
        //sres.send()
    })(req, res, next)
});
// app.post('/login', passport.authenticate('local', {
//     successRedirect: 'http://localhost:4200/admin',
//     failureRedirect: 'http://localhost:4200/login'
// }));
app.get('/logout', function (req, res) {
    req.logout();
    req.session.destroy();
    console.log('LOgoUT');
    res.redirect('http://localhost:4200/login');
})
app.get('/teams/:teamId/users', function (req, res) {
    const params = req.query;
    getUsersOfTeam(function (result) {
        let users = result;
        res.json(users);
    }, req.params.teamId, null, params.amount, params.offset, params.isCount);
})
app.delete('/teams/:teamId/users/:userId', function (req, res) {
    console.log(req.params.teamId)
    console.log(req.params.userId)
    deleteUserFromTeam(function (results) {
        res.send({ status: 200 });
    }, req.params.teamId, req.params.userId);
})
app.get('/team', function (req, res) {
    const params = req.query;
    getTeams(function (result) {
        let allTeams = result;
        res.json(allTeams);
    }, null, params.amount, params.offset, params.isCount);
})
app.delete('/team/:teamId', function (req, res) {
    deleteTeam(function (results) {
        res.send({ status: 200 });
    }, req.params.teamId);
})
app.post('/team', function (req, res) {
    insertTeam(function (results, error) {
        if (results) {
            res.send({ status: 200 });
        } else {
            res.send({ status: 400 });
        }
    }, req.body.team);
})
app.post('/teams/:teamId/users', function (req, res) {
    insertUsersOfTeam(function (results, error) {
        if (results) {
            res.send({ status: 200 });
        } else {
            res.send({ status: 400 });
        }
    }, req.params.teamId, req.body.users);
})
app.put('/teams/:teamId/users/:userId', function (req, res) {
    updateUsersOfTeam(function (results, error) {
        if (results) {
            res.send({ status: 200 });
        } else {
            res.send({ status: 400 });
        }
    }, req.params.teamId, req.params.userId, req.body.item)
})
app.put('/team/:teamId', function (req, res) {
    console.log(req.body.team)
    updateTeam(function (results, error) {
        if (results) {
            res.send({ status: 201 });
        } else {
            res.send({ status: 401 });
        }
    }, req.params.teamId, req.body.team);
})
app.get('/roles', function (req, res) {
    let allRoles;
    const params = req.query;
    getRole(function (result) {
        allRoles = result;
        res.json(allRoles);
    }, null, params.amount, params.offset, params.isCount, params.name);
})
app.get('/user', function (req, res) {
    let allUsers;
    const params = req.query;
    getUsers(function (result) {
        allUsers = result;
        console.log(allUsers);
        res.json(allUsers);
    }, null, params.amount, params.offset, params.isCount);
})
app.delete('/user/:userId', function (req, res) {
    console.log(req.params.reqId)
    deleteUser(function (results) {
        res.send({ status: 200 });
    }, req.params.userId);
})
app.post('/user', function (req, res) {
    insertUser(function (results, error) {
        if (results) {
            res.send({ status: 200 });
        } else {
            res.send({ status: 400 });
        }
    }, req.body.user);
})
app.put('/user/:userId', function (req, res) {
    console.log(111233)
    updateUser(function (results, error) {
        if (results) {
            res.send({ status: 201 });
        } else {
            res.send({ status: 401 });
        }
    }, req.params.userId, req.body.user);
})

function authenticationMiddleware() {
    return function (req, res, next) {
        //console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
        //console.log(req.isAuthenticated())
        if (req.isAuthenticated()) {
            return next()
        }
        res.send({ status: 401 });
    }
}