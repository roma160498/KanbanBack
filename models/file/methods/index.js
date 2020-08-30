const file = require('../../../routes/file');

module.exports = (connection) => {
    const serverDirectory = `.\\\\uploads\\\\`;
    const fs = require('fs');

    const saveFileToDB = (callback, fileObject) => {
        const file = {
            type: fileObject.type,
            size: fileObject.size,
            path: serverDirectory + fileObject.name,
            description: fileObject.description || ''
        };
        console.log(file)
        connection.query(`INSERT INTO file (path, size, type, description) Values 
        ("${file.path}", "${file.size}", "${file.type}", "${file.description}")`, function (error, results, fields) {
            console.log(error)
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };

    const saveFileToFS = (file, callback) => {
        fs.copyFileSync(file.path, serverDirectory + file.name);
        callback();
    };

    const getImagePathFromDB = (callback, id) => {
        connection.query(`SELECT path from file where id=${id}`, function (error, results, fields) {
            if (error) {
                console.log(error);
                return error;
            }
            return callback(results);
        });
    };

    const getFile = (callback, id) => {
        connection.query(`SELECT path from file where id=${id}`, function (error, results, fields) {
            if (error) {
                console.log(error);
                return error;
            }
            return callback(results);
        });
    };

    const getUserAvatar = (callback, userId) => {
        connection.query(`SELECT f.path from file as f left join user as u 
        on f.id = u.image_id where u.id=${userId}`, function (error, results, fields) {
            console.log(error)
            if (error) {
                console.log(error);
                return error;
            }
            return callback(results);
        });
    }

    const getAllFiles = (callback, userId) => {
        connection.query(`SELECT * from file`, function (error, results, fields) {
            console.log(error)
            if (error) {
                console.log(error);
                return error;
            }
            return callback(results);
        });
    }

    const deleteFile = (callback, id) => {
        connection.query(`DELETE from file where id="${id}"`, function (error, results, fields) {
            console.log(error, 'lol')
            if (error) {
                console.log(error);
                return error;
            }
            return callback(results);
        });
    }
    return {
        saveFileToDB,
        saveFileToFS,
        getImagePathFromDB,
        getUserAvatar,
        getAllFiles,
        deleteFile,
        getFile
    };
}