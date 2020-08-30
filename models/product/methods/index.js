module.exports = (connection) => {
    const historyMethods = require('../../history/methods')(connection);

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
    const insertProduct = (callback, product, userName) => {
        connection.query(`INSERT INTO product (name, description) Values ("${product['name']}", "${product['description']}")`, function (error, results, fields) {
            console.log(error)
            if (error) {
                return callback(null, error);
            }
            historyMethods.addHistoryNote('product', results.insertId, {
                operationType: 'add',
                date: Date.now(),
                userName: userName
            }, () => {
                callback(results)
            });
        });
    };
    const updateProduct = (callback, id, product, diff, userName) => {
        let statementsString = '';
        for (let key of Object.keys(product)) {
            statementsString += `${key}='${product[key]}',`
        }
        statementsString = statementsString.slice(0, -1)
        connection.query(`UPDATE product SET ${statementsString} where id='${id}'`, function (error, results, fields) {
            console.log(error)
            if (error) {
                return callback(null, error);
            }
            historyMethods.addHistoryNote('product', id, {
                operationType: 'update',
                date: Date.now(),
                diff: diff,
                userName: userName
            }, () => {
                callback(results)
            });
        });
    };

    const getFeaturesOfProduct = (callback, productId, properties, amount, offset, isCount) => {
        let propString = properties ? properties.join(',') : '*';
        propString = isCount ? `COUNT(${propString}) as sum` : propString;
        let amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
        let offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
        connection.query(`SELECT f.id, f.name, f.description, f.acc_criteria, f.modified_on, f.created_on, f.closed_on, f.increment_id,
        f.creater_id, concat(u.name, ' ', u.surname) as creator_name, f.wsjf,
        f.type_id, fc.name as type_name,
        f.team_id, f.status_id, t.name as team_name, st.name as status_name
        from feature as f
        left join product
        on product.id = f.product_id
        left join user as u
        on u.id = f.creater_id
        left join featureclassification as fc
        on fc.id = f.type_id
        left join team as t
        on t.id = f.team_id
        left join product as p
        on p.id = f.product_id
        left join featurestate as st
        on st.id = f.status_id
        where product.id = ${productId} 
        ${amountParam} ${offsetParam}`, function (error, results, fields) {
                if (error) {
                    return error;
                }
                return callback(results);
            });
    };
    const getIncrementsOfProduct = (callback, productId, properties, amount, offset, isCount) => {
        let propString = properties ? properties.join(',') : '*';
        propString = isCount ? `COUNT(${propString}) as sum` : propString;
        let amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
        let offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
        connection.query(`SELECT i.id, i.name, i.product_id, i.start_date, i.end_date, i.status_id,
        i.business_objectives, p.name as product_name, st.name as status_name
        from increment as i
        inner join product as p
        on p.id = i.product_id
        left join incrementstate as st
        on st.id = i.status_id
        where p.id = ${productId} 
        ${amountParam} ${offsetParam}`, function (error, results, fields) {
                if (error) {
                    return error;
                }
                return callback(results);
            });
    }
    return {
        getProducts,
        deleteProduct,
        insertProduct,
        updateProduct,
        getFeaturesOfProduct,
        getIncrementsOfProduct
    };
}