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
    return {
        getUsers,
        insertUser,
        deleteUser,
        updateUser,
        findUserByName,
        getUserPermission,
        updateUserPermission
    };
}