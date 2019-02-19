module.exports = (connection) => {
    const getIncrementStates = (callback) => {
        connection.query(`SELECT *from incrementstate`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    return {
        getIncrementStates
    };
}