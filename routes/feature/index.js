module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    
    const methods = require('../../models/feature/methods')(connection);

    router.get('/', function (req, res) {
        const params = req.query;
        methods.getFeatures(function (result) {
            res.json(result);
        }, null, params.amount, params.offset, params.isCount);
    });
    router.post('/', function (req, res) {
        methods.insertFeature(function (results, error) {
            if (results) {
                res.send({ status: 200 });
            } else {
                res.send({ status: 400 });
            }
        }, req.body.feature, req.body.userName);
    });
    router.put('/:featureId', function (req, res) {
        methods.updateFeature(function (results, error) {
            if (results) {
                res.send({ status: 201 });
            } else {
                res.send({ status: 401 });
            }
        }, req.params.featureId, req.body.feature, req.body.diff, req.body.userName);
    });
    router.delete('/:featureId', function (req, res) {
        methods.deleteFeature(function (results) {
            res.send({ status: 200 });
        }, req.params.featureId);
    });

    router.get('/:featureId/issues', function (req, res) {
        const params = req.query;
        methods.getIssuesOfFeature(req.params.featureId, function (result) {
            res.json(result);
        },  null, params.amount, params.offset, params.isCount);
    });

    return router;
};