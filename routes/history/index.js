module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    
    const methods = require('../../models/history/methods')(connection);
    
    router.get('/', function (req, res) {
        const params = req.query;
        console.log(params);
        methods.getHistoryNote(params.type, params.id, (result) => {
            res.json(result);
        })
    });

    return router;
};