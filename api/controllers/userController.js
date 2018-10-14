function getUsersFromDB(callback, properties, amount, offset, isCount) {
    let propString = properties ? properties.join(',') : '*';
    propString = isCount ? `COUNT(${propString}) as sum` : propString;
    let amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
    let offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
    //console.log(`SELECT ${propString} from user ${amountParam} ${offsetParam}`)
    connection.query(`SELECT ${propString} from user ${amountParam} ${offsetParam}`, function (error, results, fields) {
        //console.log(results)
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
        console.log(allUsers);
        res.json(allUsers);
    }, null, params.amount, params.offset, params.isCount);
}