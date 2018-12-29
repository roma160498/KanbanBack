module.exports = (connection) => {
    const roleInst = require('../../role/methods')(connection);
    const getTeams = (callback, properties, amount, offset, isCount) => {
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
    };
    const deleteTeam = (callback, id) => {
        connection.query(`DELETE from team where id="${id}"`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    const insertTeam = (callback, team) => {
        connection.query(`INSERT INTO team (name) Values ("${team['name']}")`, function (error, results, fields) {
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };
    const updateTeam = (callback, id, team) => {
        let statementsString = '';
        for (let key of Object.keys(team)) {
            statementsString += `${key}='${team[key]}',`;
        }
        statementsString = statementsString.slice(0, -1);
        connection.query(`UPDATE team SET ${statementsString} where id='${id}'`, function (error, results, fields) {
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };

    const getUsersOfTeam = (callback, teamId, properties, amount, offset, isCount) => {
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
                if (error) {
                    return error;
                }
                return callback(results);
            });
    }
    const deleteUserFromTeam = (callback, teamId, userId) => {
        connection.query(`DELETE from team_user where user_id="${userId}" and team_id="${teamId}"`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    }
    const insertUsersOfTeam = (callback, teamId, users) => {
        roleInst.getRole(function (roles) {
            let values = '';
            for (let user of users) {
                let roleId = roles.filter((el => el.name === user.roleName))[0].id;
                values += ` ("${teamId}", "${user['id']}", "${roleId}"),`
            }
            values = values.slice(0, -1)
                connection.query(`INSERT INTO team_user (team_id, user_id, role_id) Values${values}`, function (error, results, fields) {
                    if (error) {
                        return callback(null, error);
                    }
                    return callback(results);
                });
            }, null, 'undefined', 'undefined', false)
    
    }
    const updateUsersOfTeam = (callback, teamId, userId, item) => {
        roleInst.getRole(function (roleObj) {
            connection.query(`UPDATE team_user SET role_id='${roleObj[0].id}' where team_id='${teamId}' and user_id='${userId}'`, function (error, results, fields) {
                if (error) {
                    return callback(null, error);
                }
                return callback(results);
            });
        }, null, 'undefined', 'undefined', false, item['roleName'])
    }
    return {
        getTeams,
        deleteTeam,
        insertTeam,
        updateTeam,
        getUsersOfTeam,
        deleteUserFromTeam,
        insertUsersOfTeam,
        updateUsersOfTeam
    };
}