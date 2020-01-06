module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    
    const methods = require('../../models/mention/methods')(connection);
    
    router.get('/:userId', function (req, res) {
        const params = req.query;
        methods.getMessagesWithUser(function (result) {
            res.json(result);
        }, req.params.userId);
    });

    router.delete('/:userId', function (req, res) {
        methods.removeMentionsNofication(function (results) {
            res.send({ status: 200 });
        }, req.params.userId);
    });
    return router;
};