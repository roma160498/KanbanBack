module.exports = (connection) => {
    const roleInst = require('../../role/methods')(connection);
    const messageHelper = require('../../../helpers/messageHelper')();

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
    const getKanbanOfTeam = (callback, teamId, properties, amount, offset, isCount) => {
        connection.query(`SELECT id, name, \`index\`, max from issuestate where team_id=${teamId}`, function (error, results, fields) {
            if (error) {
                return callback(null, error);
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
        connection.beginTransaction(function (err) {
            let teamId;
            connection.query(`INSERT INTO team (name) Values ("${team['name']}")`, function (error, results, fields) {
                if (error) {
                    return connection.rollback(function () {
                        return callback(null, error);
                    });
                }
                teamId = results.insertId;
                const kanban = team.kanbanColumns;
                const stateQueryArray = [];
                for (let i = 0; i < kanban.length; i++) {
                    const max = kanban[i].max;
                    const colQuery = `(${teamId}, ${kanban[i].index}, "${kanban[i].name}", ${max ? max : null})`;
                    stateQueryArray.push(colQuery);
                }
                connection.query(`INSERT INTO issuestate (team_id, \`index\`, name, max) Values ${stateQueryArray.join(', ')}`, function (error, results, fields) {
                    if (error) {
                        return connection.rollback(function () {
                            return callback(null, error);
                        });
                    }
                    connection.commit(function (err) {
                        if (err) {
                            return connection.rollback(function () {
                                throw err;
                            });
                        }
                        return callback(results);
                    });
                });
            });
        });
    };
    const updateTeam = (callback, id, team) => {
        let statementsString = '';
        for (let key of Object.keys(team)) {
            if (key !== 'kanbanColumns') {
                statementsString += `${key}='${team[key]}',`;
            }
        }


        statementsString = statementsString.slice(0, -1);
        connection.beginTransaction(function (err) {
            if (statementsString) {
                connection.query(`UPDATE team SET ${statementsString} where id='${id}'`, function (error, results, fields) {
                    if (error) {
                        return connection.rollback(function () {
                            return callback(null, error);
                        });
                    }
                    updateKanbanCols(id, team, callback);
                });
            } else {
                updateKanbanCols(id, team, callback);
            }
        });

    };

    const updateKanbanCols = (teamId, team, callback) => {
        const kanbanCols = team.kanbanColumns;
        const colQueryForNew = [];
        const colQueryForDelete = [];
        const colQueryForUpdate = [];
        kanbanCols.forEach(element => {
            const max = element.max;
            switch (element.state) {
                case 'new':
                    const colNewQuery = `(${teamId}, ${element.index}, "${element.name}", ${max ? max : null})`;
                    colQueryForNew.push(colNewQuery);
                    break;
                case 'delete':
                    colQueryForDelete.push(element.id);
                    break;
                case 'edit':
                    const colUpdateQuery = `(${element.id}, ${teamId}, ${element.index}, "${element.name}", ${max ? max : null})`;
                    colQueryForUpdate.push(colUpdateQuery);
                    break;
            }
        });
        let isQueryNeed = {
            insert: colQueryForNew.length,
            delete: colQueryForDelete.length,
            update: colQueryForUpdate.length
        };
        const insertQuery = `INSERT INTO issuestate (team_id, \`index\`, name, max) Values ${colQueryForNew.join(', ')}`;
        const deleteQuery = `DELETE from issuestate where id in (${colQueryForDelete.join(', ')})`;
        const updateQuery = `INSERT INTO issuestate (id, team_id, \`index\`, name, max) Value ${colQueryForUpdate.join(', ')} 
        ON DUPLICATE KEY UPDATE name=VALUES(name), max=VALUES(max), \`index\`=VALUES(\`index\`);`;
        const firstQuery = isQueryNeed.insert ? insertQuery :
            isQueryNeed.delete ? deleteQuery :
                isQueryNeed.update ? updateQuery : null;
        if (firstQuery) {
            connection.query(firstQuery, function (error, results, fields) {
                if (error) {
                    return connection.rollback(function () {
                        return callback(null, {
                            message: messageHelper.getMessage(error, {
                                source: 'team state',
                                child: 'issue'
                            })
                        });
                    });
                }
                const secondQuery = isQueryNeed.delete ? deleteQuery :
                    isQueryNeed.update ? updateQuery : null;
                if (secondQuery) {
                    connection.query(secondQuery, function (error, results, fields) {
                        if (error) {
                            return connection.rollback(function () {
                                return callback(null, {
                                    message: messageHelper.getMessage(error, {
                                        source: 'team state',
                                        child: 'issue'
                                    })
                                });
                            });
                        }
                        const thirdQuery = isQueryNeed.update ? updateQuery : null;
                        if (thirdQuery) {
                            connection.query(thirdQuery, function (error, results, fields) {
                                if (error) {
                                    return connection.rollback(function () {
                                        return callback(null, {
                                            message: messageHelper.getMessage(error, {
                                                source: 'team state',
                                                child: 'issue'
                                            })
                                        });
                                    });
                                }
                                connection.commit(function (err) {
                                    if (err) {
                                        return connection.rollback(function () {
                                            throw err;
                                        });
                                    }
                                    return callback(results);
                                });
                            });
                        } else {
                            connection.commit(function (err) {
                                if (err) {
                                    return connection.rollback(function () {
                                        throw err;
                                    });
                                }
                                return callback(results);
                            });
                        }
                    });
                } else {
                    connection.commit(function (err) {
                        if (err) {
                            return connection.rollback(function () {
                                throw err;
                            });
                        }
                        return callback(results);
                    });
                }
            });
        } else {
            connection.commit(function (err) {
                if (err) {
                    return connection.rollback(function () {
                        throw err;
                    });
                }
                return callback({});
            });
        }
    }

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
        let propString = `i.id, i.status_id, i.feature_id, i.iteration_id, i.classification_id, i.team_id,
        i.user_id, i.story_points, i.completeness, i.name, i.description, i.accCriteria, i.closed_on,
        f.name as feature_name,
        it.name as iteration_name,
        t.name as team_name,
        u.name as user_name,
        u.surname as user_surname,
        cl.name as classification_name,
        st.name as status_name`;
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
        on cl.id = i.classification_id 
        left join issuestate as st
        on st.id = i.status_id where i.team_id = ${teamId}
        ${amountParam} ${offsetParam}`, function (error, results, fields) {
                console.log(results)
                if (error) {
                    return error;
                }
                return callback(results);
            });
    };
    const getKanbanBoardForTeam = (callback, teamId) => {
        connection.beginTransaction(function (err) {
            connection.query(`SELECT t.id as team_id, 
            t.name as team_name, 
            ist.name as state_name, 
            ist.index as state_index, 
            ist.max as state_max, 
            ist.id as state_id,
            i.name as issue_name,
            i.user_id as issue_userId,
            unew.name as user_name,
            unew.surname as user_surname,
            unew.login as user_login,
            i.classification_id as issues_classificationId,
            i.iteration_id as issue_iterationId,
            i.name as issue_iterationName,
            i.story_points as issue_stPoint,
            i.id as issueId
            FROM team as t
            
            left join issuestate as ist
            on t.id = ist.team_id
            left join issue as i
            on i.status_id = ist.id
            left join user as unew
            on i.user_id = unew.id
            where t.id = ${teamId};`, function (error, results, fields) {
                console.log(results)
                if (error) {
                    return connection.rollback(function () {
                        return callback(null, error);
                    });
                }
                if (results.length) {
                    const kanbansArray = [];
                    const tempTeamMap = {};
                    const tempStatesMap = {};
                    results.forEach(element => {
                        const teamId = element.team_id;
                        const stateId = element.state_id;
                        const asigneeName = element.user_login ? element.user_name === '' || element.user_surname === '' ? element.user_login : `${element.user_name} ${element.user_surname}` : ' ';
                        if (tempTeamMap[teamId] || tempTeamMap[teamId] === 0) {
                            if (tempStatesMap[stateId]) {
                                if (element.issueId) {
                                    const tempTeam = kanbansArray[tempTeamMap[tempStatesMap[stateId].teamId]];
                                    const tempState = tempTeam.states[tempStatesMap[stateId].indexInStates];
                                    tempState.issues.push({
                                        id: element.issueId,
                                        userId: element.issue_userId,
                                        userName: asigneeName,
                                        classification: element.issues_classificationId,
                                        iteration: element.issue_iterationId,
                                        name: element.issue_name,
                                        storyPoints: element.issue_stPoint,
                                        stateId: stateId,
                                        teamId: teamId
                                    });
                                }
                            } else {
                                const statesArray = kanbansArray[tempTeamMap[teamId]].states;
                                tempStatesMap[stateId] = { teamId: teamId, indexInStates: statesArray.length };
                                const issuesArray = [];
                                if (element.issueId) {
                                    issuesArray.push({
                                        id: element.issueId,
                                        userId: element.issue_userId,
                                        userName: asigneeName,
                                        classification: element.issues_classificationId,
                                        iteration: element.issue_iterationId,
                                        name: element.issue_name,
                                        storyPoints: element.issue_stPoint,
                                        stateId: stateId,
                                        teamId: teamId
                                    });
                                }
                                statesArray.push({
                                    name: element.state_name,
                                    id: element.state_id,
                                    max: element.state_max,
                                    index: element.state_index,
                                    issues: issuesArray
                                });
                            }
                        } else {
                            tempTeamMap[teamId] = kanbansArray.length;
                            const issuesArray = [];
                            if (element.issueId) {
                                issuesArray.push({
                                    id: element.issueId,
                                    userId: element.issue_userId,
                                    userName: asigneeName,
                                    classification: element.issues_classificationId,
                                    iteration: element.issue_iterationId,
                                    iterationName: element.issue_iterationName,
                                    name: element.issue_name,
                                    storyPoints: element.issue_stPoint,
                                    stateId: stateId,
                                    teamId: teamId
                                });
                            } 
                            kanbansArray.push({
                                name: element.team_name,
                                id: teamId,
                                states: [{
                                    name: element.state_name,
                                    id: element.state_id,
                                    max: element.state_max,
                                    index: element.state_index,
                                    issues: issuesArray
                                }]
                            });
                            tempStatesMap[stateId] = { teamId: teamId, indexInStates: 0 };
                        }
                    });
                    kanbansArray.forEach(element => {
                        element.states.sort((a, b) => {
                            if (a.index > b.index) {
                                return 1;
                            }
                            if (a.index < b.index) {
                                return -1;
                            }
                            return 0;
                        });
                    })
                    connection.commit(function (err) {
                        if (err) {
                            return connection.rollback(function () {
                                throw err;
                            });
                        }
                        return callback(kanbansArray);
                    });
                }
            });
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
        getIssuesOfTeam,
        getKanbanOfTeam,
        getKanbanBoardForTeam
    };
}