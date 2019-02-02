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
    };
    const getIssuesOfTeam = (callback, teamId, properties, amount, offset, isCount) => {
        let propString =  `i.id, i.status_id, i.feature_id, i.iteration_id, i.classification_id, i.team_id,
        i.user_id, i.story_points, i.completeness, i.name, i.description, i.accCriteria,
        f.name as feature_name,
        it.name as iteration_name,
        t.name as team_name,
        u.name as user_name,
        u.surname as user_surname,
        cl.name as classification_name`;
        propString = isCount ? `COUNT(${'*'}) as sum` : propString;
        const amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
        const offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
        connection.query(`SELECT ${propString} from issue as i
        left join iteration as it
        on it.id = i.iteration_id
        left join feature as f
        on f.id = i.feature_id
        left join team as t
        on t.id = i.team_id
        left join user as u
        on u.id = i.user_id
        left join issueclassification as cl
        on cl.id = i.classification_id where i.team_id = ${teamId}
        ${amountParam} ${offsetParam}`, function (error, results, fields) {
            console.log(results)
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    return {
        getTeams,
        deleteTeam,
        insertTeam,
        updateTeam,
        getUsersOfTeam,
        deleteUserFromTeam,
        insertUsersOfTeam,
        updateUsersOfTeam,
        getIssuesOfTeam
    };
}