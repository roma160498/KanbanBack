

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
    router.use('/iterationstates', require('./iterationstate')(connection));
    router.use('/incrementstates', require('./incrementstate')(connection));
    router.use('/featurestates', require('./featurestate')(connection));
    router.use('/comments', require('./comment')(connection));
    router.use('/mentions', require('./mention')(connection));
    router.use('/files', require('./file')(connection));
    router.use('/history', require('./history')(connection));

    return router;
};
