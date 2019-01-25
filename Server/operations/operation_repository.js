const squel = require('squel');
const runQuery = require('../pgConnection');



/**
 * Database Query is Executed
 * @param {String} query the database query which is to be executed
 * @returns {Object[]} the result of running database query
 */
async function queryExecute(query) {
    const client = await runQuery.pool.connect();

    let result
    try {
        await client.query('BEGIN');
        try {
            result = await client.query(query);
        } catch (err) {
            // console.log(err, "ERROR");
            await client.query('ROLLBACK');
            return Promise.reject(err);
        }
    } finally {
        client.release();
    }
    return result;

}

/**
 * Gets the list of records (i.e fields data) of specified table
 * @param {Number} id the id of Specified table of which data is fetched 
 * @returns {newArray :Object[]} the list of data/object of specified table
 */
async function view(id) {

    let query = squel
        .select()
        .from("fieldstable")
        .where("tableid =?", id)
        .toString();

    try {
        let resp = await queryExecute(query);
        let newArray = [];
        resp.rows.forEach((item) => {
            let datas = {};

            for (var key in item) {
                if (key == 'fieldname' || key == 'label') {
                    datas[key] = unescape(item[key]);
                } else {
                    datas[key] = item[key];
                }
            }
            newArray.push(datas);
        });

        return newArray;

    } catch (err) {
        return Promise.reject(err.message);
    }
}


/**
 * Inserting the data to table
 * @param {Object} req Its body provide the data to be inserted into the table
 * @param {Number} id  the table id on which changes is to be made
 * @returns {Object[]} the result of running insert data query
 */
async function addDataToTable(req, id) {


    console.log(req.body, "Body");
    console.log(req.file, "File");

    let body = [req.body];
    let colquery = '';
    let values = '';

    let query1 = squel
        .select()
        .from("mastertable")
        .where("id =?", id)
        .toString();

    try {
        let res1 = await queryExecute(query1);
        let tablename = res1.rows[0].tablename;

        body.forEach(function (element) {
            for (var keys in element) {
                if (typeof element[keys] == 'object' && element[keys] != null) {
                    let data = '';
                    for (var key in element[keys]) {
                        if (element[keys][key]) {
                            data = data + [key] + ','
                        }
                    }
                    data = data.replace(/(^[,\s]+)|([,\s]+$)/g, '');
                    colquery = colquery + '"' + escape([keys]) + '"' + ',';
                    values = values + `'` + '{' + data + '}' + `'` + `,`

                } else if (element[keys] != null) {
                    colquery = colquery + '"' + escape([keys]) + '"' + ',';
                    values = values + `'` + element[keys] + `'` + ','
                } else {
                    colquery = colquery + '"' + escape([keys]) + '"' + ',';
                    values = values + null + ','
                }
            }
        });

        colquery = colquery.replace(/(^[,\s]+)|([,\s]+$)/g, '');
        values = values.replace(/(^[,\s]+)|([,\s]+$)/g, '');


        // let query2 = `INSERT INTO ${res1.rows[0].tablename} (${colquery}) VALUES (${values})`
        let query2 = `INSERT INTO "${tablename}" (${colquery}) VALUES (${values})`

        console.log(query2, "QUERY2")

        let res2 = await queryExecute(query2);

        if (req.file) {

        }

        await queryExecute('COMMIT');

        if (res2.rowCount > 0) {
            return res2;
        } else {
            return Promise.reject(err);
        }
    } catch (err) {
        return Promise.reject(err);
    }
}

/**
 * Fetch all the records from the specified table
 * @param {Number} [id] the table id of which records are to be fetched.
 * @returns {Object[]} the list of record from specified table
 */
async function TableData(id) {

    let newArray = [];
    let query = squel
        .select()
        .from("mastertable")
        .field("tablename")
        .where("id =?", id)
        .toString();

    try {
        let res = await queryExecute(query);

        let query1 = squel
            .select()
            .from(`"${res.rows[0].tablename}"`)
            .toString();
        let res1 = await queryExecute(query1);

        console.log("RESPONSE", res1.rows);

        res1.rows.forEach((item) => {
            let datas = {};

            for (var key in item) {
                keys = unescape(key);
                datas[keys] = item[key];
            }
            newArray.push(datas);
        });


        console.log("New Array", newArray);

        return newArray;

    } catch (err) {
        return Promise.reject(err.message);
    }
}

/**
 * Delete the record from the specified table
 * @param {Number} tableid the id of the table in which the changes is to be made.
 * @param {Number} rowid  the id of row which is to be deleted.
 * @returns {Object[]} the result of running delete data query
 */
async function deleteData(tableid, rowid) {

    let query = squel
        .select()
        .from("mastertable")
        .field("tablename")
        .where("id =?", tableid)
        .toString();

    try {
        let res = await queryExecute(query);

        let query1 = squel
            .delete()
            .from(`"${res.rows[0].tablename}"`)
            .where("uid= ? ", rowid)
            .toString();

        let res1 = await queryExecute(query1);

        await queryExecute('COMMIT');

        return res1

    } catch (err) {
        return Promise.reject(err.message);
    }
}

/**
 * Fetch the details of specified row of specified table
 * @param {Number} tableid the id of the table of which the data will be fetched
 * @param {Number} uid the id of the row from a table 
 * @returns {newArray: Object[]} the record of specified table 
 */
async function getdetails(tableid, uid) {

    let query = squel
        .select()
        .from("mastertable")
        .field("tablename")
        .where("id =?", tableid)
        .toString();

    try {
        let res = await queryExecute(query);
        let newArray = [];
        let finalArray = [];


        let query1 = squel
            .select()
            .from(`"${res.rows[0].tablename}"`)
            .where("uid= ? ", uid)
            .toString();

        let res1 = await queryExecute(query1);

        console.log(res1.rows, "RES1");

        res1.rows.forEach((item) => {
            let datas = {};

            for (var key in item) {
                if (item[key] != null) {
                    keys = unescape(key);
                    datas[keys] = item[key];
                }
            }
            newArray.push(datas);
        });

        console.log(newArray, "NewArray");

        newArray.forEach((item, index) => {
            for (var key in item) {
                if (item[key] && typeof item[key] == 'object' && item[key].length != undefined) {
                    let data = {};
                    for (let i = 0; i < item[key].length; i++) {

                        data[item[key][i]] = true;
                    }
                    item[key] = data;
                }
            }
        })

        console.log(newArray, "11111111111111NewArray");

        return newArray;

    } catch (err) {
        return Promise.reject(err.message);
    }
}

/**
 * Update/Edit the rrecords of specified table
 * @param {Object} req It provides the data for updating the specified row.
 * @param {Number} id  The table id in which the row is to be updated/edited.
 * @returns {Object[]} The result of running update data query.
 */
async function updateRow(req, id) {

    console.log(req.body, "BODy");

    let body = [req.body];
    let values = '';
    let condition = '';
    body.forEach((element) => {
        for (var keys in element) {
            if (keys == 'uid') {
                condition = keys + `=` + `'` + element[keys] + `'`
            } else {
                if (typeof element[keys] == 'object' && element[keys] != null) {
                    let data = '';
                    for (var key in element[keys]) {
                        if (element[keys][key]) {
                            data = data + [key] + ','
                        }
                    }
                    data = data.replace(/(^[,\s]+)|([,\s]+$)/g, '');
                    values = values + '"' + escape(keys) + '"' + `=` + `'` + '{' + data + '}' + `'` + ',';

                } else if (element[keys] != null) {
                    values = values + '"' + escape(keys) + '"' + `=` + `'` + element[keys] + `'` + ',';
                } else {
                    values = values + '"' + escape(keys) + '"' + `=` + null + ',';
                }
            }
        }
    });

    values = values.replace(/(^[,\s]+)|([,\s]+$)/g, '');

    console.log(values, "Values");
    let query = squel
        .select()
        .from("mastertable")
        .field("tablename")
        .where("id =?", id)
        .toString();


    try {
        let res = await queryExecute(query);
        let tablename = res.rows[0].tablename;

        let query1 = `UPDATE "${tablename}" SET ${values} WHERE ${condition};`

        console.log(query1, "QUERY!!!!");

        let res1 = await queryExecute(query1);
        await queryExecute('COMMIT');

        return res1;

    } catch (err) {
        return Promise.reject(err);
    }
}

/**
 * Fetch all the records of dropdown 
 * @param {Number} tableid the id of the table of which the data is to be fetched
 * @returns {Object[]} the list of record of specified table
 */
async function fetchDropdownList(tableid) {

    let query = squel
        .select()
        .from("dropdowntable")
        .where("tableid =?", tableid)
        .toString();

    try {
        let res = await queryExecute(query);
        if (res.rowCount > 0) {
            return res.rows;
        } else {
            return false;
        }

    } catch (err) {
        return Promise.reject(err.message);
    }
}

/**
 * Fetch all the records of radiobutton 
 * @param {Number} tableid the id of the table of which the data is to be fetched
 * @returns {Object[]} the list of record of specified table
 */
async function fetchRadioList(tableid) {

    let query = squel
        .select()
        .from("radiotable")
        .where("tableid =?", tableid)
        .toString();

    console.log(query, "1111")
    try {
        let res = await queryExecute(query);
        if (res.rowCount > 0) {
            // console.log(res);
            return res.rows;
        } else {
            return false;
        }

    } catch (err) {
        return Promise.reject(err.message);
    }
}

/**
 * Fetch all the records of checkbox 
 * @param {Number} tableid the id of the table of which the data is to be fetched
 * @returns {Object[]} the list of record of specified table
 */
async function fetchCheckboxList(tableid) {

    let query = squel
        .select()
        .from("checkboxtable")
        .where("tableid =?", tableid)
        .toString();

    console.log(query, "1111")
    try {
        let res = await queryExecute(query);
        if (res.rowCount > 0) {
            // console.log(res);
            return res.rows;
        } else {
            return false;
        }

    } catch (err) {
        return Promise.reject(err.message);
    }
}

/**
 * Get the table name of specified id
 * @param {Number} tableid the specified table id
 * @returns {tablename : {String}} the specified table name.
 */
async function tablename(tableid) {

    let query = squel
        .select()
        .from("mastertable")
        .where("id =?", tableid)
        .toString();

    try {
        let res = await queryExecute(query);
        if (res.rowCount > 0) {
            let tablename = unescape(res.rows[0].tablename)
            return tablename;
        } else {
            return Promise.reject({
                msg: "NO RECORD FOUND"
            });
        }

    } catch (err) {
        return Promise.reject(err.message);
    }
}

/**
 * Checking token from the records of database
 * @param {Number} tableid the specified table id 
 * @param {String} token  the token to be checked.
 * @returns {Boolean} If true the token is a valid token .
 */
async function checkToken(tableid, token) {

    let query = squel
        .select()
        .from("urltable")
        .where("tableid =?", tableid)
        .where("token= ?", token)
        .toString();

    try {
        let res = await queryExecute(query);
        if (res.rowCount > 0) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        return Promise.reject(err.message);
    }
}





module.exports = {
    view: view,
    addDataToTable: addDataToTable,
    TableData: TableData,
    deleteData: deleteData,
    getdetails: getdetails,
    updateRow: updateRow,
    fetchDropdownList: fetchDropdownList,
    tablename: tablename,
    fetchRadioList: fetchRadioList,
    fetchCheckboxList: fetchCheckboxList,
    checkToken: checkToken,
}