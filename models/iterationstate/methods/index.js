module.exports = (connection) => {
    const getIterationStates = (callback) => {
        connection.query(`SELECT *from iterationstate`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    return {
        getIterationStates
    };
}