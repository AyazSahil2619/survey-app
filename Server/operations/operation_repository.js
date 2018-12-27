const squel = require('squel');
const runQuery = require('../pgConnection');


async function queryExecute(query) {
    const client = await runQuery.pool.connect();

    let result
    try {
        await client.query('BEGIN');
        try {
            result = await client.query(query);
            // await client.query('COMMIT');
        } catch (err) {
            console.log(err, "ERROR");
            await client.query('ROLLBACK');
            return Promise.reject(err);
        }
    } finally {
        client.release();
    }
    return result;
    // try {
    //     let res = await runQuery.pool.query(query);
    //     return res;

    // } catch (err) {
    //     return Promise.reject(err)
    // }

}
async function view(req, res, id) {


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

async function addDataToTable(req, res, id) {

    let body = [req.body];
    let colquery = '';
    let values = '';

    // let checkboxValue = req.body.checkboxData;


    let query1 = squel
        .select()
        .from("mastertable")
        .where("id =?", id)
        .toString();


    try {
        let res1 = await queryExecute(query1);

        let tablename = res1.rows[0].tablename;

        // body.forEach((item) => {
        //     for (var key in item) {
        //         if (key != 'checkboxData') {
        //             colquery = colquery + '"' + key + '"' + ',';
        //             values = values + `'` + item[key] + `'` + ',';
        //         } else if (key == 'checkboxData') {
        //             checkboxValue.forEach((element) => {
        //                 for (var keys in element) {
        //                     colquery = colquery + '"' + keys + '"' + ',';
        //                     values = values + `'` + '{' + element[keys] + '}' + `'` + ',';
        //                 }
        //             })

        //         }
        //     }
        // })


        console.log(body, "BODY");

        body.forEach(function (element) {
            for (var keys in element) {
                if (typeof element[keys] == 'object') {
                    let data = '';
                    for (var key in element[keys]) {
                        if (element[keys][key]) {
                            data = data + [key] + ','
                        }
                    }
                    data = data.replace(/(^[,\s]+)|([,\s]+$)/g, '');
                    colquery = colquery + '"' + escape([keys]) + '"' + ',';
                    values = values + `'` + '{' + data + '}' + `'` + `,`

                } else {
                    colquery = colquery + '"' + escape([keys]) + '"' + ',';
                    values = values + `'` + element[keys] + `'` + ','
                }
            }
        });

        console.log("colquery", colquery);
        console.log(values, "VALUES")

        colquery = colquery.replace(/(^[,\s]+)|([,\s]+$)/g, '');
        values = values.replace(/(^[,\s]+)|([,\s]+$)/g, '');


        // let query2 = `INSERT INTO ${res1.rows[0].tablename} (${colquery}) VALUES (${values})`
        let query2 = `INSERT INTO "${tablename}" (${colquery}) VALUES (${values})`

        console.log(query2, "QUERY2")

        let res2 = await queryExecute(query2);
        await queryExecute('COMMIT');


        if (res2.rowCount > 0) {
            return res2;
        } else {
            return Promise.reject(err);
        }
    } catch (err) {
        console.log(err, "Error in adding data to table");
        return Promise.reject(err);
    }
}


async function TableData(req, res, id) {

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

        res1.rows.forEach((item) => {
            let datas = {};

            for (var key in item) {
                keys = unescape(key);
                datas[keys] = item[key];
            }
            newArray.push(datas);
        });

        // console.log(newArray, "aaa");
        return newArray;

        // return res1

    } catch (err) {
        return Promise.reject(err.message);
    }
}

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
        res1.rows.forEach((item) => {
            let datas = {};

            for (var key in item) {
                keys = unescape(key);
                datas[keys] = item[key];
            }
            newArray.push(datas);
        });

        console.log(newArray, "NEW ARRAY");

        newArray.forEach((item, index) => {
            for (var key in item) {
                if (item[key] && typeof item[key] == 'object' && item[key].length != undefined) {
                    console.log("IN HERE")
                    let data = {};
                    for (let i = 0; i < item[key].length; i++) {

                        data[item[key][i]] = true;
                    }
                    item[key] = data;
                }
            }
        })

        console.log(newArray, "getdetails");

        return newArray;

    } catch (err) {
        return Promise.reject(err.message);
    }
}


async function updateRow(req, res, id) {

    let body = [req.body];
    let values = '';
    let condition = '';

    console.log(body, "pppppp");

    body.forEach((element) => {
        for (var keys in element) {
            if (keys == 'uid') {
                condition = keys + `=` + `'` + element[keys] + `'`
            } else {

                if (typeof element[keys] == 'object') {
                    let data = '';
                    for (var key in element[keys]) {
                        if (element[keys][key]) {
                            data = data + [key] + ','
                        }
                    }
                    data = data.replace(/(^[,\s]+)|([,\s]+$)/g, '');
                    values = values + '"' + escape(keys) + '"' + `=` + `'` + '{' + data + '}' + `'` + ',';

                } else {
                    values = values + '"' + escape(keys) + '"' + `=` + `'` + element[keys] + `'` + ',';
                }
            }
        }
    });

    values = values.replace(/(^[,\s]+)|([,\s]+$)/g, '');
    console.log(values, "VALUES");


    let query = squel
        .select()
        .from("mastertable")
        .field("tablename")
        .where("id =?", id)
        .toString();


    try {
        let res = await queryExecute(query);
        let tablename = res.rows[0].tablename;

        // body.forEach((item, index) => {
        //     for (var key in item) {
        //         if (key != 'uid') {
        //             // values = values + key + `=` + `'` + item[key] + `'` + ',';
        //             values = values + '"' + escape(key) + '"' + `=` + `'` + item[key] + `'` + ',';
        //         } else {
        //             condition = key + `=` + `'` + item[key] + `'`
        //         }
        //     }
        // })

        let query1 = `UPDATE "${tablename}" SET ${values} WHERE ${condition};`

        let res1 = await queryExecute(query1);
        await queryExecute('COMMIT');

        return res1;

    } catch (err) {
        return Promise.reject(err);
    }
}

async function fetchDropdownList(tableid) {

    let query = squel
        .select()
        .from("dropdowntable")
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

async function tablename(tableid) {

    let query = squel
        .select()
        .from("mastertable")
        .where("id =?", tableid)
        .toString();

    console.log(query, "1111")
    try {
        let res = await queryExecute(query);
        if (res.rowCount > 0) {
            // console.log(res.rows[0]);
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
    checkToken: checkToken
}