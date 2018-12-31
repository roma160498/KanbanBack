module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    
    const methods = require('../../models/featureclassification/methods')(connection);

    router.get('/', function (req, res) {
        const params = req.query;
        methods.getFeatureClassifications(function (result) {
            res.json(result);
        }, null, params.amount, params.offset, params.isCount);
    });

    return router;
};