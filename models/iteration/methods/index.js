module.exports = (connection) => {
    const getIterations = (callback, properties, amount, offset, isCount) => {
        let propString =  `i.id, i.name, i.increment_id, i.start_date, i.end_date, i.status_id,
        i.completeness, i.story_points, inc.name as increment_name`;
        propString = isCount ? `COUNT(${'*'}) as sum` : propString;
        const amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
        const offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
        connection.query(`SELECT ${propString} from iteration as i
        inner join increment as inc
        on inc.id = i.increment_id
        ${amountParam} ${offsetParam}`, function (error, results, fields) {
            console.log(results)
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    const deleteIteration = (callback, id) => {
        connection.query(`DELETE from iteration where id="${id}"`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    const insertIteration = (callback, iteration) => {
        connection.query(`INSERT INTO iteration (name, increment_id, start_date, end_date, status_id, story_points, completeness) Values ("${iteration['name']}", "${iteration['increment_id']}", "${iteration['start_date']}", "${iteration['end_date']}", "${iteration['status_id']}", "${iteration['story_points']}", "${iteration['completeness']}")`, function (error, results, fields) {
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };
    const updateIteration = (callback, id, iteration) => {
        let statementsString = '';
        for (let key of Object.keys(iteration)) {
            statementsString += `${key}='${iteration[key]}',`;
        }
        statementsString = statementsString.slice(0, -1);
        connection.query(`UPDATE iteration SET ${statementsString} where id='${id}'`, function (error, results, fields) {
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };
    return {
        getIterations,
        deleteIteration,
        insertIteration,
        updateIteration
    };
}