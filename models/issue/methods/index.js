module.exports = (connection) => {
    const getIssues = (callback, properties, amount, offset, isCount) => {
        let propString =  `i.id, i.status_id, i.feature_id, i.iteration_id, i.classification_id, i.team_id,
        i.user_id, i.story_points, i.completeness, i.name, i.description, i.accCriteria,
        f.name as feature_name,
        it.name as iteration_name,
        t.name as team_name,
        u.name as user_name,
        u.surname as user_surname,
        u.login as user_login,
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
        on st.id = i.status_id
        ${amountParam} ${offsetParam}`, function (error, results, fields) {
            console.log(results)
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    const deleteIssue = (callback, id) => {
        connection.query(`DELETE from issue where id="${id}"`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    const insertIssue = (callback, issue) => {
        connection.query(`INSERT INTO issue (status_id, feature_id, iteration_id, classification_id, team_id, user_id, story_points, completeness, name, description, accCriteria) Values (${issue['status_id']}, ${issue['feature_id']}, ${issue['iteration_id']},  ${issue['classification_id']}, ${issue['team_id']}, ${issue['user_id']}, ${issue['story_points']}, ${issue['completeness']}, "${issue['name']}", "${issue['description']}", "${issue['accCriteria']}")`, function (error, results, fields) {
            console.log(error);
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };
    const updateIssue = (callback, id, issue) => {
        let statementsString = '';
        for (let key of Object.keys(issue)) {
            statementsString += `${key}='${issue[key]}',`;
        }
        console.log(issue)
        statementsString = statementsString.slice(0, -1);
        connection.query(`UPDATE issue SET ${statementsString} where id='${id}'`, function (error, results, fields) {
            console.log(error)
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };
    return {
        getIssues,
        deleteIssue,
        insertIssue,
        updateIssue
    };
}