

module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();

    // Items
    router.use('/user', require('./user')(connection));
    router.use('/teams', require('./team')(connection));
    router.use('/roles', require('./role')(connection));
    router.use('/products', require('./product')(connection));
    router.use('/features', require('./feature')(connection));

    // Authentication operation
    //router.use(require('./authentication')(connection));

    return router;
};
