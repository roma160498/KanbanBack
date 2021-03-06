function getUsersFromDB(callback, properties, amount, offset, isCount) {
    let propString = properties ? properties.join(',') : '*';
    propString = isCount ? `COUNT(${propString}) as sum` : propString;
    let amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
    let offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
    connection.query(`SELECT ${propString} from user ${amountParam} ${offsetParam}`, function (error, results, fields) {
        if (error) {
            return error;
        }
        return callback(results);
    });
}

exports.getUsers = function (req, res) {
    let allUsers;
    const params = req.query;
    getUsersFromDB(function (result) {
        allUsers = result;
        res.json(allUsers);
    }, null, params.amount, params.offset, params.isCount);
}