module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    
    const methods = require('../../models/product/methods')(connection);
    
    router.delete('/:productId', function (req, res) {
        methods.deleteProduct(function (results) {
            res.send({ status: 200 });
        }, req.params.productId);
    });
    router.post('/', function (req, res) {
        methods.insertProduct(function (results, error) {
            if (results) {
                res.send({ status: 200 });
            } else {
                res.send({ status: 400 });
            }
        }, req.body.product, req.body.userName);
    });
    router.put('/:productId', function (req, res) {
        methods.updateProduct(function (results, error) {
            if (results) {
                res.send({ status: 201 });
            } else {
                res.send({ status: 401 });
            }
        }, req.params.productId, req.body.product, req.body.diff, req.body.userName);
    });
    router.get('/', function (req, res) {
        const params = req.query;
        methods.getProducts(function (result) {
            res.json(result);
        }, null, params.amount, params.offset, params.isCount);
    });

    router.get('/:productId/features', function (req, res) {
        const params = req.query;
        methods.getFeaturesOfProduct(function (result) {
            res.json(result);
        }, req.params.productId, null, params.amount, params.offset, params.isCount);
    });
    router.get('/:productId/increments', function (req, res) {
        const params = req.query;
        methods.getIncrementsOfProduct(function (result) {
            res.json(result);
        }, req.params.productId, null, params.amount, params.offset, params.isCount);
    });
    return router;
};