module.exports = (connection) => {
    const getMessagesWithUser = (callback, userId) => {
        connection.query(`SELECT c.text, c.date, c.user_id as author, c.issue_id,
        u.name, u.surname, u.login, t.id as teamId, t.name as teamName from mention as m
        left join comments as c on
        m.comment_id = c.id
        left join user as u on
        u.id = c.user_id
        left join issue as i on
        i.id = c.issue_id
        left join team as t on
        i.team_id = t.id
        where m.user_id=${userId}`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    };

    const removeMentionsNofication = (callback, userId) => {
        connection.query(`DELETE from mention where user_id="${userId}"`, function (error, results, fields) {
            
            if (error) {
                return error;
            }
            return callback(results);
        });
    }
   
    return {
        getMessagesWithUser,
        removeMentionsNofication
    };
}