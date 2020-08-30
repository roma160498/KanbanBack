module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    
    const methods = require('../../models/iteration/methods')(connection);
    
    router.delete('/:iterationId', function (req, res) {
        methods.deleteIteration(function (results) {
            res.send({ status: 200 });
        }, req.params.iterationId);
    });
    router.post('/', function (req, res) {
        methods.insertIteration(function (results, error) {
            if (results) {
                res.send({ status: 200 });
            } else {
                res.send({ status: 400 });
            }
        }, req.body.iteration, req.body.userName);
    });
    router.put('/:iterationId', function (req, res) {
        methods.updateIteration(function (results, error) {
            if (results) {
                res.send({ status: 201 });
            } else {
                res.send({ status: 401 });
            }
        }, req.params.iterationId, req.body.iteration, req.body.diff, req.body.userName);
    });
    router.get('/', function (req, res) {
        const params = req.query;
        methods.getIterations(function (result) {
            res.json(result);
        }, null, params.amount, params.offset, params.isCount);
    });

    router.get('/:iterationId/issues', function (req, res) {
        const params = req.query;
        methods.getIssuesOfIteration(req.params.iterationId, function (result) {
            res.json(result);
        },  null, params.amount, params.offset, params.isCount);
    });
    return router;
};