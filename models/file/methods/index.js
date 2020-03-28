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
        connection.query(`INSERT INTO file (path, size, type, description) Values 
        ("${file.path}", "${file.size}", "${file.type}", "${file.description}")`, function (error, results, fields) {
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };

    const saveFileToFS = (file) => {
        
        fs.copyFile(file.path, serverDirectory + file.name, function(err) {  
            return err ? false : true;
        });
    };

    return {
        saveFileToDB,
        saveFileToFS
    };
}