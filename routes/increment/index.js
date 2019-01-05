module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    
    const methods = require('../../models/increment/methods')(connection);
    
    router.delete('/:incrementId', function (req, res) {
        methods.deleteIncrement(function (results) {
            res.send({ status: 200 });
        }, req.params.incrementId);
    });
    router.post('/', function (req, res) {
        methods.insertIncrement(function (results, error) {
            if (results) {
                res.send({ status: 200 });
            } else {
                res.send({ status: 400 });
            }
        }, req.body.increment);
    });
    router.put('/:incrementId', function (req, res) {
        methods.updateIncrement(function (results, error) {
            if (results) {
                res.send({ status: 201 });
            } else {
                res.send({ status: 401 });
            }
        }, req.params.incrementId, req.body.increment);
    });
    router.get('/', function (req, res) {
        const params = req.query;
        methods.getIncrements(function (result) {
            res.json(result);
        }, null, params.amount, params.offset, params.isCount);
    });
    return router;
};