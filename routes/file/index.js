module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    const formidable = require('formidable');
    const fileDataAccessLayer = require('../../models/file/methods')(connection);
    
    const methods = require('../../models/increment/methods')(connection);

    router.post('/', function (req, res) {
        const form = new formidable.IncomingForm();
        form.on('file', (fields, file) => {
            fileDataAccessLayer.saveFileToDB((result, err) => {
                fileDataAccessLayer.saveFileToFS(file);
            }, file);            
        });
        form.parse(req);
    });
   
    return router;
};