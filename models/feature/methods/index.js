module.exports = (connection) => {
    const getFeatures = (callback, properties, amount, offset, isCount) => {
        let propString = `f.id, f.name, f.description, f.acc_criteria, f.modified_on, f.created_on, f.closed_on,
        f.creater_id, concat(u.name, ' ', u.surname) as creator_name,
        f.type_id, fc.name as type_name,
        f.team_id, t.name as team_name,
        f.product_id, p.name as product_name`;
        propString = isCount ? `COUNT(${'*'}) as sum` : propString;
        let amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
        let offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
        const query = `SELECT ${propString} from feature as f inner join user as u
        on u.id = f.creater_id
        inner join featureclassification as fc
        on fc.id = f.type_id
        inner join team as t
        on t.id = f.team_id
        inner join product as p
        on p.id = f.product_id ${amountParam} ${offsetParam}`
        connection.query(query, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    }
    return {
        getFeatures
    };
}