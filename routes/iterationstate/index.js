module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    
    const methods = require('../../models/iterationstate/methods')(connection);
    
    router.get('/', function (req, res) {
        methods.getIterationStates(function (result) {
            res.json(result);
        });
    });
    return router;
};