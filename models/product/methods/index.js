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

    const getFeaturesOfProduct = (callback, productId, properties, amount, offset, isCount) => {
        let propString = properties ? properties.join(',') : '*';
        propString = isCount ? `COUNT(${propString}) as sum` : propString;
        let amountParam = amount !== 'undefined' ? 'limit ' + amount : '';
        let offsetParam = offset !== 'undefined' ? 'offset ' + offset : '';
        connection.query(`SELECT f.name, f.description, f.acc_criteria, f.modified_on, f.created_on, f.closed_on, 
        f.creater_id, concat(u.name, ' ', u.surname) as creator_name,
        f.type_id, fc.name as type_name,
        f.team_id, f.status_id, t.name as team_name, st.name as status_name
        from feature as f
        inner join product
        on product.id = f.product_id
        inner join user as u
        on u.id = f.creater_id
        inner join featureclassification as fc
        on fc.id = f.type_id
        inner join team as t
        on t.id = f.team_id
        inner join product as p
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
            console.log(results)
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