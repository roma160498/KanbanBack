module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    
    const methods = require('../../models/team/methods')(connection);
    
    router.get('/', function (req, res) {
        const params = req.query;
        methods.getTeams(function (result) {
            let allTeams = result;
            res.json(allTeams);
        }, null, params.amount, params.offset, params.isCount);
    });
    router.delete('/:teamId', function (req, res) {
        methods.deleteTeam(function (results) {
            res.send({ status: 200 });
        }, req.params.teamId);
    });
    router.post('/', function (req, res) {
        methods.insertTeam(function (results, error) {
            if (results) {
                res.send({ status: 200 });
            } else {
                res.send({ status: 400 });
            }
        }, req.body.team);
    });
    router.put('/:teamId', function (req, res) {
        methods.updateTeam(function (results, error) {
            if (results) {
                res.send({ status: 201 });
            } else {
                res.send({ status: 401 });
            }
        }, req.params.teamId, req.body.team);
    });

    router.get('/:teamId/users', function (req, res) {
        const params = req.query;
        methods.getUsersOfTeam(function (result) {
            let users = result;
            res.json(users);
        }, req.params.teamId, null, params.amount, params.offset, params.isCount);
    });
    router.delete('/:teamId/users/:userId', function (req, res) {
        methods.deleteUserFromTeam(function (results) {
            res.send({ status: 200 });
        }, req.params.teamId, req.params.userId);
    });
    router.post('/:teamId/users', function (req, res) {
        methods.insertUsersOfTeam(function (results, error) {
            if (results) {
                res.send({ status: 200 });
            } else {
                res.send({ status: 400 });
            }
        }, req.params.teamId, req.body.users);
    });
    router.put('/:teamId/users/:userId', function (req, res) {
        methods.updateUsersOfTeam(function (results, error) {
            if (results) {
                res.send({ status: 200 });
            } else {
                res.send({ status: 400 });
            }
        }, req.params.teamId, req.params.userId, req.body.item)
    });
    router.get('/:teamId/issues', function (req, res) {
        const params = req.query;
        methods.getIssuesOfTeam(function (result) {
            res.json(result);
        }, req.params.teamId, null, params.amount, params.offset, params.isCount);
    });
    return router;
};