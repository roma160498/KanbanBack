module.exports = (connection) => {
    const getRole = (callback, properties, amount, offset, isCount, name) => {
        let propString = properties ? properties.join(',') : '*';
        propString = isCount ? `COUNT(${propString}) as sum` : propString;
        let amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
        let offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
        let whereStatement = name !== 'undefined' && name ? ` where name='${name}'` : '';
        connection.query(`SELECT ${propString} from role ${amountParam} ${offsetParam} ${whereStatement}`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    }
    return {
        getRole
    };
}