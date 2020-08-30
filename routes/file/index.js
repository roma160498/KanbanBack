module.exports = (connection) => {
    const express = require('express');
    const router = express.Router();
    const formidable = require('formidable');
    const fileDataAccessLayer = require('../../models/file/methods')(connection);
    const userDALayer = require('../../models/user/methods')(connection);
    const path = require('path');
    const methods = require('../../models/increment/methods')(connection);

    router.post('/userAvatar/:userId', function (req, res) {
        console.log('get')
        const form = new formidable.IncomingForm();
        form.on('file', (fields, file) => {
            fileDataAccessLayer.saveFileToDB((result, err) => {
                console.log(result);
                fileDataAccessLayer.saveFileToFS(file, () => {
                    userDALayer.updateUser(() => {
                        console.log(path.resolve(`uploads/${file.name}`));
                        res.sendFile(path.resolve(`uploads/${file.name}`))
                    }, req.params.userId, {
                        image_id: result.insertId
                    })
                });
                // res.send({ status: 200 });
            }, file);            
        });
        form.parse(req);
    });

    router.get('/', function (req, res) {
        fileDataAccessLayer.getAllFiles((result, err) => {
            res.json(result);
        });
    });

    router.delete('/:id', function(req, res) {
        fileDataAccessLayer.deleteFile((result, err) => {
            res.json(result);
        }, req.params.id)
    });

    router.post('/', function (req, res) {
        const form = new formidable.IncomingForm();
        form.on('file', (fields, file) => {
            fileDataAccessLayer.saveFileToDB((result, err) => {
                console.log(result);
                fileDataAccessLayer.saveFileToFS(file, () => {
                    res.send({ status: 200 });
                });
                // res.send({ status: 200 });
            }, file);            
        });
        form.parse(req);
    });

    router.get('/:id', function(req, res) {
        fileDataAccessLayer.getFile((result, err) => {
            if (!result[0]) {
                res.send({ status: 200 });
                return;
            }
            res.sendFile(path.resolve(result[0].path));
        }, req.params.id)
    })

    router.get('/uploadedImages/name/:fileName', function (req, res) {
        console.log(req.params.fileName);
        res.sendFile(path.resolve(`uploads/${req.params.fileName}`))
    });

    router.get('/uploadedImages/id/:id', function (req, res) {
        fileDataAccessLayer.getImagePathFromDB((result) => {
            if (!result[0]) {
                res.send({ status: 200 });
                return;
            }
            res.sendFile(path.resolve(result[0].path));
        }, req.params.id);
    });

    router.get('/uploadedImages/userAvatar/:id', function (req, res) {
        fileDataAccessLayer.getUserAvatar((result) => {
            if (!result[0]) {
                res.send({ status: 200 });
                return;
            }
            res.sendFile(path.resolve(result[0].path));
        }, req.params.id);
    });
   
    return router;
};