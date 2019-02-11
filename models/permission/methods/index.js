module.exports = (connection) => {
    const deafultUserPermissions = {
        users: {
            get: true,
            update: false,
            create: false,
            delete: false
        },
        teams: {
            get: true,
            update: false,
            create: false,
            delete: false
        },
        products: {
            get: true,
            update: false,
            create: false,
            delete: false
        },
        features: {
            get: true,
            update: true,
            create: true,
            delete: true
        },
        issues: {
            get: true,
            update: true,
            create: true,
            delete: true
        },
        'program increments': {
            get: true,
            update: true,
            create: true,
            delete: true
        },
        iterations: {
            get: true,
            update: true,
            create: true,
            delete: true
        }
    };
    const defaultAdminPermissions = {
        users: {
            get: true,
            update: true,
            create: true,
            delete: true
        },
        teams: {
            get: true,
            update: true,
            create: true,
            delete: true
        },
        products: {
            get: true,
            update: true,
            create: true,
            delete: true
        },
        features: {
            get: true,
            update: true,
            create: true,
            delete: true
        },
        issues: {
            get: true,
            update: true,
            create: true,
            delete: true
        },
        'program increments': {
            get: true,
            update: true,
            create: true,
            delete: true
        },
        iterations: {
            get: true,
            update: true,
            create: true,
            delete: true
        }
    };

    const insertUserDefaultPermissions = (callback, userId) => {
        const jsonPerm = JSON.stringify(deafultUserPermissions);
        connection.query(`INSERT INTO permission (user_id, permissions) values
        (${userId}, '${jsonPerm}')`, function (error, results, fields) {
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };

    const insertAdminPermissions = (callback, userId) => {
        console.log(userId + '111')
        const jsonPerm = JSON.stringify(defaultAdminPermissions);
        connection.query(`INSERT INTO permission (user_id, permissions) values
        (${userId}, '${jsonPerm}')`, function (error, results, fields) {
            console.log(error)
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };

    const updateToUserDefaultPermission = (callback, userId) => {
        console.log(userId+'2222')
        const jsonPerm = JSON.stringify(deafultUserPermissions);
        connection.query(`UPDATE permission SET permissions='${jsonPerm}' where user_id=${userId}`, function(error, results, fields) {
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };

    const updateToAdminPermission = (callback, userId) => {
        const jsonPerm = JSON.stringify(defaultAdminPermissions);
        connection.query(`UPDATE permission SET permissions='${jsonPerm}' where user_id=${userId}`, function (error, results, fields) {
            console.log(error)
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    }
   
    return {
        insertUserDefaultPermissions,
        insertAdminPermissions,
        updateToUserDefaultPermission,
        updateToAdminPermission
    };
}