module.exports = (connection) => {
    const getUsers = (callback, properties, amount, offset, isCount) => {
        let propString = properties ? properties.join(',') : '*';
        propString = isCount ? `COUNT(${propString}) as sum` : propString;
        const amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
        const offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
        connection.query(`SELECT ${propString} from user ${amountParam} ${offsetParam}`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    const insertUser = (callback, user) => {
        connection.query(`INSERT INTO user (login, password, name, surname, email, is_admin) Values ("${user['login']}", "${user['password']}", "${user['name']}", "${user['surname']}", "${user['email']}", ${user['is_admin']})`, function (error, results, fields) {
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };
    const deleteUser = (callback, id) => {
        connection.query(`DELETE from user where id="${id}"`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    const updateUser = (callback, id, user) => {
        let statementsString = '';
        for (let key of Object.keys(user)) {
            statementsString += `${key}='${user[key]}',`;
        }
        statementsString = statementsString.slice(0, -1);
        connection.query(`UPDATE user SET ${statementsString} where id='${id}'`, function (error, results, fields) {
            console.log(error)
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };
    const findUserByName = (username, callback) => {
        connection.query(`SELECT u.*, p.permissions from user as u 
        left join permission as p on
        p.user_id = u.id where login="${username}" `, function (error, results, fields) {
            if (error) {
                return callback(error);
            }
            return results[0] ? callback(null, results[0]) : callback(null);
        });
    };
    const getUserPermission = (callback, userId, properties, amount, offset, isCount) => {
        let propString = properties ? properties.join(',') : '*';
        propString = isCount ? `COUNT(${propString}) as sum` : propString;
        const amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
        const offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
        connection.query(`SELECT ${propString} from permission ${amountParam} ${offsetParam} where user_id=${userId}`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    const updateUserPermission = (callback, userId, permissions) => {
        connection.query(`UPDATE permission SET permissions='${permissions}' where user_id=${userId}`, function (error, results, fields) {
            if (error) {
                return callback(null, error);
            }
            return callback(results);
         });
    };
    const getKanbansForUser = (callback, userId) => {
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
            FROM team_user as tu 
            left join team as t 
            on t.id = tu.team_id
            left join user as u
            on u.id = tu.user_id
            left join issuestate as ist
            on t.id = ist.team_id
            left join issue as i
            on i.status_id = ist.id
            left join user as unew
            on i.user_id = unew.id
            where u.id = ${userId};`, function (error, results, fields) {
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
        getUsers,
        insertUser,
        deleteUser,
        updateUser,
        findUserByName,
        getUserPermission,
        updateUserPermission,
        getKanbansForUser
    };
}