module.exports = (connection) => {
    const getFeatureClassifications = (callback, properties, amount, offset, isCount) => {
        let propString = properties ? properties.join(',') : '*';
        propString = isCount ? `COUNT(${propString}) as sum` : propString;
        let amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
        let offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
        connection.query(`SELECT ${propString} from featureclassification ${amountParam} ${offsetParam}`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    }
    return {
        getFeatureClassifications
    };
}