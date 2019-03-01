module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    
    const methods = require('../../models/issue/methods')(connection);
    const commentMethods = require('../../models/comment/methods')(connection);
    
    router.delete('/:issueId', function (req, res) {
        methods.deleteIssue(function (results) {
            res.send({ status: 200 });
        }, req.params.issueId);
    });
    router.post('/', function (req, res) {
        methods.insertIssue(function (results, error) {
            if (results) {
                res.send({ status: 200, insertId: results.insertId });
            } else {
                res.send({ status: 400 });
            }
        }, req.body.issue);
    });
    router.put('/:issueId', function (req, res) {
        methods.updateIssue(function (results, error) {
            if (results) {
                res.send({ status: 201 });
            } else {
                res.send({ status: 401 });
            }
        }, req.params.issueId, req.body.issue);
    });
    router.get('/', function (req, res) {
        const params = req.query;
        methods.getIssues(function (result) {
            res.json(result);
        }, null, params.amount, params.offset, params.isCount);
    });
    router.get('/:issueId/comments', function (req, res) {
        const params = req.query;
        commentMethods.getCommentsByIssue(function (result) {
            res.json(result);
        }, req.params.issueId);
    });
    return router;
};