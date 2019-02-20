module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    
    const methods = require('../../models/featurestate/methods')(connection);
    
    router.get('/', function (req, res) {
        methods.getFeatureStates(function (result) {
            res.json(result);
        });
    });
    return router;
};