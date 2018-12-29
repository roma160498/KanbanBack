module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    
    const methods = require('../../models/user/methods')(connection);
    
    router.get('/', function (req, res) {
        const params = req.query;
        methods.getUsers(function (result) {
            res.json(result);
        }, null, params.amount, params.offset, params.isCount)
    });
    router.post('/', function (req, res) {
        methods.insertUser(function (results, error) {
            if (results) {
                res.send({ status: 200 });
            } else {
                res.send({ status: 400 });
            }
        }, req.body.user);
    });
    router.delete('/:userId', function (req, res) {
        console.log(req.params.reqId)
        methods.deleteUser(function (results) {
            res.send({ status: 200 });
        }, req.params.userId);
    });
    router.put('/:userId', function (req, res) {
        methods.updateUser(function (results, error) {
            if (results) {
                res.send({ status: 201 });
            } else {
                res.send({ status: 401 });
            }
        }, req.params.userId, req.body.user);
    })
    return router
};