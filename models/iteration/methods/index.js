module.exports = (connection) => {
    const historyMethods = require('../../history/methods')(connection);

    const getIterations = (callback, properties, amount, offset, isCount) => {
        let propString =  `i.id, i.name, i.increment_id, i.start_date, i.end_date, i.status_id,
        i.completeness, i.story_points, inc.name as increment_name, st.name as status_name`;
        propString = isCount ? `COUNT(${'*'}) as sum` : propString;
        const amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
        const offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
        connection.query(`SELECT ${propString} from iteration as i
        inner join increment as inc
        on inc.id = i.increment_id
        inner join iterationstate as st
        on st.id = i.status_id
        ${amountParam} ${offsetParam}`, function (error, results, fields) {
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
    const insertIteration = (callback, iteration, userName) => {
        connection.query(`INSERT INTO iteration (name, increment_id, start_date, end_date, status_id, story_points, completeness) Values ("${iteration['name']}", "${iteration['increment_id']}", "${iteration['start_date']}", "${iteration['end_date']}", "${iteration['status_id']}", "${iteration['story_points']}", "${iteration['completeness']}")`, function (error, results, fields) {
            if (error) {
                return callback(null, error);
            }
            historyMethods.addHistoryNote('iteration', results.insertId, {
                operationType: 'add',
                date: Date.now(),
                userName: userName
            }, () => {
                callback(results)
            });
        });
    };
    const updateIteration = (callback, id, iteration, diff, userName) => {
        let statementsString = '';
        for (let key of Object.keys(iteration)) {
            statementsString += `${key}='${iteration[key]}',`;
        }
        statementsString = statementsString.slice(0, -1);
        connection.query(`UPDATE iteration SET ${statementsString} where id='${id}'`, function (error, results, fields) {
            if (error) {
                return callback(null, error);
            }
            historyMethods.addHistoryNote('iteration', id, {
                operationType: 'update',
                date: Date.now(),
                diff: diff,
                userName: userName
            }, () => {
                callback(results)
            });
        });
    };

    getIssuesOfIteration = (iterationId, callback, properties, amount, offset, isCount) => {
        let propString =  `i.id, i.status_id, i.feature_id, i.iteration_id, i.classification_id, i.team_id,
        i.user_id, i.story_points, i.completeness, i.name, i.description, i.accCriteria, i.closed_on,
        f.name as feature_name,
        it.name as iteration_name,
        t.name as team_name,
        u.name as user_name,
        u.surname as user_surname,
        cl.name as classification_name,
        st.name as status_name`;
        propString = isCount ? `COUNT(${'*'}) as sum` : propString;
        const amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
        const offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
        connection.query(`SELECT ${propString} from issue as i
        left join iteration as it
        on it.id = i.iteration_id
        left join feature as f
        on f.id = i.feature_id
        left join team as t
        on t.id = i.team_id
        left join user as u
        on u.id = i.user_id
        left join issueclassification as cl
        on cl.id = i.classification_id 
        left join issuestate as st
        on st.id = i.status_id where i.iteration_id = ${iterationId}
        ${amountParam} ${offsetParam}`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    return {
        getIterations,
        deleteIteration,
        insertIteration,
        updateIteration,
        getIssuesOfIteration
    };
}