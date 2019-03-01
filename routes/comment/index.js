module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    
    const methods = require('../../models/comment/methods')(connection);

    // router.get('/', function (req, res) {
    //     const params = req.query;
    //     methods.getFeatures(function (result) {
    //         res.json(result);
    //     }, null, params.amount, params.offset, params.isCount);
    // });
    router.post('/', function (req, res) {
        console.log(123332131232645234826354723)
        methods.insertComment(function (results, error) {
            if (results) {
                res.send({ status: 200, insertId: results.insertId });
            } else {
                res.send({ status: 400 });
            }
        }, req.body.comment);
    });
    // router.delete('/:commentId', function (req, res) {
    //     methods.deleteFeature(function (results) {
    //         res.send({ status: 200 });
    //     }, req.params.featureId);
    // });

    return router;
};