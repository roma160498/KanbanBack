module.exports = (connection) => {
    const getProducts = (callback, properties, amount, offset, isCount) => {
        let propString = properties ? properties.join(',') : '*';
        propString = isCount ? `COUNT(${propString}) as sum` : propString;
        let amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
        let offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
        connection.query(`SELECT ${propString} from product ${amountParam} ${offsetParam}`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    const deleteProduct = (callback, id) => {
        connection.query(`DELETE from product where id="${id}"`, function (error, results, fields) {
            if (error) {
                return error;
            }
            return callback(results);
        });
    };
    const insertProduct = (callback, product) => {
        connection.query(`INSERT INTO product (name, description) Values ("${product['name']}", "${product['description']}")`, function (error, results, fields) {
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };
    const updateProduct = (callback, id, product) => {
        let statementsString = '';
        for (let key of Object.keys(product)) {
            statementsString += `${key}='${product[key]}',`
        }
        statementsString = statementsString.slice(0, -1)
        connection.query(`UPDATE product SET ${statementsString} where id='${id}'`, function (error, results, fields) {
            if (error) {
                return callback(null, error);
            }
            return callback(results);
        });
    };
    return {
        getProducts,
        deleteProduct,
        insertProduct,
        updateProduct
    };
}