module.exports = (connection) => {
    const getFeatureStates = (callback) => {
        connection.query(`SELECT * from featurestate`, function (error, results, fields) {
            if (error) {
                return error;
            }
            results.sort((a, b) => {
                if (a.id > b.id) {
                    return 1;
                }
                if (a.id < b.id) {
                    return -1;
                }
                return 0;
            })
            return callback(results);
        });
    };
    return {
        getFeatureStates
    };
}