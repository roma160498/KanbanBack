module.exports = (connection) => {
    const insertComment = (callback, comment) => {
        connection.beginTransaction(function (err) {
            connection.query(`INSERT INTO comments (text, issue_id, parentComment_id, user_id) 
        Values ("${comment['text']}", ${comment['issue_id']}, ${comment['parentComment_id']}, ${comment['user_id']})`, function (error, results, fields) {
                    if (error) {
                        return connection.rollback(function () {
                            return callback(null, error);
                        });
                    }
                    if (comment.mentions.length) {
                        let valuesStr = [];
                        for (let i = 0; i < comment.mentions.length; i++) {
                            valuesStr.push(`(${comment.mentions[i].id}, ${results.insertId})`);
                        }
                        connection.query(`INSERT INTO mention (user_id, comment_id) values ${valuesStr.join(', ')}`, function (error, results, fields) {
                            if (error) {
                                return connection.rollback(function () {
                                    return callback(null, error);
                                });
                            }

                            connection.commit(function (err) {
                                if (err) {
                                    return connection.rollback(function () {
                                        throw err;
                                    });
                                }
                                return callback(results);
                            });
                        });
                    } else {
                        connection.commit(function (err) {
                            if (err) {
                                return connection.rollback(function () {
                                    throw err;
                                });
                            }
                            return callback(results);
                        });
                    }
                });
        });
    };
    const getCommentsByIssue = (callback, issueId) => {
        connection.query(`Select com.*, u.name, u.surname, u.login from comments as com left join user as u on u.id = com.user_id
        where com.issue_id=${issueId}`, function (error, results, fields) {
                if (error) {
                    return callback(null, error);
                }
                const commentMap = {};
                results.forEach(element => {
                    commentMap[element.id] = element;
                    element.comments = [];
                });
                for (let key in commentMap) {
                    const comment = commentMap[key];
                    if (comment.parentComment_id) {
                        commentMap[comment.parentComment_id].comments.push(comment);
                    }
                }

                const comments = [];
                for (let key in commentMap) {
                    if (commentMap[key].parentComment_id === null) {
                        comments.push(commentMap[key]);
                    }
                }
                return callback(comments);
            });
    }
    return {
        insertComment,
        getCommentsByIssue
    };
}