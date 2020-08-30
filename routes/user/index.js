module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    
    const methods = require('../../models/user/methods')(connection);
    const permissionMethods = require('../../models/permission/methods')(connection);
    
    router.get('/', function (req, res) {
        const params = req.query;
        methods.getUsers(function (result) {
            res.json(result);
        }, null, params.amount, params.offset, params.isCount)
    });
    router.post('/', function (req, res) {
        methods.insertUser(function (results, error) {
            if (results) {
                if (req.body.user.is_admin) {
                    permissionMethods.insertAdminPermissions(function (results, error) {
                        if (results) {
                            res.send({ status: 200, insertId: results.insertId });
                        } else {
                            res.send({ status: 400 });
                        }
                    }, results.insertId);
                } else {
                    permissionMethods.insertUserDefaultPermissions(function (results, error) {
                        if (results) {
                            res.send({ status: 200, insertId: results.insertId });
                        } else {
                            res.send({ status: 400 });
                        }
                    }, results.insertId);
                }
            } else {
                res.send({ status: 400 });
            }
        }, req.body.user, req.body.userName);
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
                if (req.body.user.is_admin === 0) {
                    permissionMethods.updateToUserDefaultPermission(function (results, error) {
                        if (results) {
                            res.send({ status: 201 });
                        } else {
                            res.send({ status: 400 });
                        }
                    }, req.params.userId);
                } else if (req.body.user.is_admin === 1) {
                    permissionMethods.updateToAdminPermission(function (results, error) {
                        if (results) {
                            res.send({ status: 201 });
                        } else {
                            res.send({ status: 400 });
                        }
                    }, req.params.userId);
                } else {
                    res.send({ status: 201 });
                }
            } else {
                res.send({ status: 401 });
            }
        }, req.params.userId, req.body.user, req.body.diff, req.body.userName);
    });

    router.get('/:userId/permissions', function (req, res) {
        const params = req.query;
        methods.getUserPermission(function (result) {
            res.json(result);
        }, req.params.userId, null, params.amount, params.offset, params.isCount)
    });
    router.put('/:userId/permissions', function (req, res) {
        methods.updateUserPermission(function (results, error) {
            if (results) {
                res.send({ status: 201 });
            } else {
                res.send({ status: 401 });
            }
        }, req.params.userId, req.body.permissions);
    });

    router.get('/:userId/kanbans', function(req, res) {
        const params = req.query;
        methods.getKanbansForUser(function (result) {
            res.json(result);
        }, req.params.userId, null, params.amount, params.offset, params.isCount)
    });
    return router
};