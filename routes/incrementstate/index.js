module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    
    const methods = require('../../models/incrementstate/methods')(connection);
    
    router.get('/', function (req, res) {
        methods.getIncrementStates(function (result) {
            res.json(result);
        });
    });
    return router;
};