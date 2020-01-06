module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    
    const methods = require('../../models/comment/methods')(connection);

    router.post('/', function (req, res) {
        methods.insertComment(function (results, error) {
            if (results) {
                res.send({ status: 200, insertId: results.insertId });
            } else {
                res.send({ status: 400 });
            }
        }, req.body.comment);
    });
    

    return router;
};