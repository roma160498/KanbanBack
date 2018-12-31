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
    };
    const insertFeature = (callback, feature) => {
        connection.query(`INSERT INTO feature (name, type_id, creater_id, team_id, description, acc_criteria, product_id, status_id)
         Values ("${feature['name']}", ${feature['type_id']}, ${feature['creater_id']}, ${feature['team_id']}, "${feature['description']}", "${feature['acc_criteria']}", ${feature['product_id']}, ${feature['status_id']})`, function (error, results, fields) {

                console.log(error)
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };
    const updateFeature = (callback, id, feature) => {
        let statementsString = '';
        for (let key of Object.keys(feature)) {
            statementsString += `${key}='${feature[key]}',`;
        }
        statementsString = statementsString.slice(0, -1);
        connection.query(`UPDATE feature SET ${statementsString} where id='${id}'`, function (error, results, fields) {
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };
    const deleteFeature = (callback, id) => {
        connection.query(`DELETE from feature where id="${id}"`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    return {
        getFeatures,
        insertFeature,
        updateFeature,
        deleteFeature
    };
}