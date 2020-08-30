const e = require("express");

module.exports = (connection) => {
    const addHistoryNote = function(itName, itemId, params, callback) {
        const changes = getChangesJson(params);
        connection.query(`INSERT INTO history (itemTypeName, itemId, changes) Values ("${itName}", "${itemId}", '${changes}')`, function (error, results, fields) {
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };

    const getHistoryNote = function(type, id, callback) {
        connection.query(`Select * from history where itemId=${id} and itemTypeName="${type}"`, function (error, results, fields) {
            console.log(results)
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    }

    const getChangesJson = function(params) {
        const changes = {
            operation: params.operationType,
            madeBy: params.user,
            date: params.date,
            diff: params.diff,
            userName: params.userName
        };
        return JSON.stringify(changes);
    }

    return {
        addHistoryNote,
        getHistoryNote
    };
}