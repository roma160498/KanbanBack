

module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    // Items
    router.use('/user', require('./user')(connection));
    router.use('/teams', require('./team')(connection));
    router.use('/roles', require('./role')(connection));
    router.use('/products', require('./product')(connection));
    router.use('/features', require('./feature')(connection));
    router.use('/featureclassifications', require('./featureclassification')(connection));
    router.use('/increments', require('./increment')(connection));
    router.use('/iterations', require('./iteration')(connection));
    router.use('/issues', require('./issue')(connection));
    router.use('/issueclassifications', require('./issueclassification')(connection));
    router.use('/permissions', require('./permission')(connection));

    // Authentication operation
    //router.use(require('./authentication')(connection));

    return router;
};
