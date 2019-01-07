module.exports = (connection) => {
    const getIncrements = (callback, properties, amount, offset, isCount) => {
        let propString =  `i.id, i.name, i.product_id, i.start_date, i.end_date, i.status_id,
        i.business_objectives, p.name as product_name`;
        propString = isCount ? `COUNT(${'*'}) as sum` : propString;
        const amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
        const offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
        connection.query(`SELECT ${propString} from increment as i
        inner join product as p
        on p.id = i.product_id
        ${amountParam} ${offsetParam}`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    const getIncrementById = (id, callback, properties, amount, offset, isCount) => {
        let propString =  `i.id, i.name, i.product_id, i.start_date, i.end_date, i.status_id,
        i.business_objectives, p.name as product_name`;
        propString = isCount ? `COUNT(${'*'}) as sum` : propString;
        const amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
        const offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
        connection.query(`SELECT ${propString} from increment as i
        inner join product as p
        on p.id = i.product_id where i.id=${id}
        ${amountParam} ${offsetParam}`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    const insertIncrement = (callback, increment) => {
        connection.query(`INSERT INTO increment (name, product_id, start_date, end_date, status_id, business_objectives) Values ("${increment['name']}", "${increment['product_id']}", "${increment['start_date'].toString().slice(0, 10)}", "${increment['end_date'].toString().slice(0, 10)}", "${increment['status_id']}", "${increment['objectives']}")`, function (error, results, fields) {
            if (error) {
                console.log(error)
                return callback(null, error);
            }
            return callback(results);
        });
    };
    const deleteIncrement = (callback, id) => {
        connection.query(`DELETE from increment where id="${id}"`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    const updateIncrement = (callback, id, increment) => {
        let statementsString = '';
        for (let key of Object.keys(increment)) {
            statementsString += `${key}='${increment[key]}',`;
        }
        statementsString = statementsString.slice(0, -1);
        console.log(`UPDATE increment SET ${statementsString} where id='${id}'`)
        connection.query(`UPDATE increment SET ${statementsString} where id='${id}'`, function (error, results, fields) {
            if (error) {
                console.log(error)
                return callback(null, error);
            }
            return callback(results);
        });
    };

    const getIterationsOfIncrement = (callback, incrementId, properties, amount, offset, isCount) => {
        let propString =  `i.id, i.name, i.increment_id, i.start_date, i.end_date, i.status_id,
        i.completeness, i.story_points, inc.name as increment_name`;
        propString = isCount ? `COUNT(${'*'}) as sum` : propString;
        const amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
        const offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
        connection.query(`SELECT ${propString} from iteration as i
        inner join increment as inc
        on inc.id = i.increment_id where inc.id = ${incrementId}  
        ${amountParam} ${offsetParam}`, function (error, results, fields) {
            console.log(results)
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    return {
        getIncrements,
        insertIncrement,
        deleteIncrement,
        updateIncrement,
        getIncrementById,
        getIterationsOfIncrement
    };
}