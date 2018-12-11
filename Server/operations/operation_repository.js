const squel = require('squel');
const runQuery = require('../pgConnection');


async function queryExecute(query) {

    try {
        let res = await runQuery.pool.query(query);
        return res;

    } catch (err) {
        return Promise.reject(err)
    }

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

        // return resp.rows;

    } catch (err) {
        return Promise.reject(err.message);
    }
}

async function addDataToTable(req, res, id) {

    console.log(req.body, "INSIDE ADDDING DATA TO TABLE")

    let body = [req.body];
    let colquery = '';
    let values = '';

    let checkboxValue = req.body.checkboxData;

    // let query = squel
    //     .select()
    //     .from("fieldstable")
    //     .field("fieldname")
    //     .where("tableid =?", id)
    //     .toString();

    let query1 = squel
        .select()
        .from("mastertable")
        .where("id =?", id)
        .toString();


    try {
        // let res = await queryExecute(query)
        let res1 = await queryExecute(query1);

        let tablename = unescape(res1.rows[0].tablename);

        // res.rows.forEach((item, index) => {
        //     for (var key in item) {
        //         if (item[key] != 'uid') {
        //             // colquery = colquery + item[key] + ',';
        //             colquery = colquery + '"' + item[key] + '"' + ',';
        //         }
        //     }
        // })

        // body.forEach((item, index) => {
        //     for (var key in item) {
        //         values = values + `'` + item[key] + `'` + ',';
        //     }
        // })

        body.forEach((item) => {
            for (var key in item) {
                if (key != 'checkboxData') {
                    colquery = colquery + '"' + key + '"' + ',';
                    values = values + `'` + item[key] + `'` + ',';
                } else if (key == 'checkboxData') {
                    checkboxValue.forEach((element) => {
                        for (var keys in element) {
                            colquery = colquery + '"' + keys + '"' + ',';
                            values = values + `'` + '{' + element[keys] + '}' + `'` + ',';
                        }
                    })

                }
            }
        })


        colquery = colquery.replace(/(^[,\s]+)|([,\s]+$)/g, '');
        values = values.replace(/(^[,\s]+)|([,\s]+$)/g, '');


        // let query2 = `INSERT INTO ${res1.rows[0].tablename} (${colquery}) VALUES (${values})`
        let query2 = `INSERT INTO "${tablename}" (${colquery}) VALUES (${values})`

        console.log(query2, "QUERY2")

        let res2 = await queryExecute(query2);

        if (res2.rowCount > 0) {
            return res2;
        } else {
            return Promise.reject(err);
        }
    } catch (err) {
        console.log(err);
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

        // console.log(newArray, "getdetails");
        return newArray;
        // return res1;

    } catch (err) {
        return Promise.reject(err.message);
    }
}


async function updateRow(req, res, id) {

    let body = [req.body];
    let values = '';

    console.log(body, "pppppp");

    let query = squel
        .select()
        .from("mastertable")
        .field("tablename")
        .where("id =?", id)
        .toString();


    try {
        let res = await queryExecute(query);
        let tablename = res.rows[0].tablename;

        body.forEach((item, index) => {
            for (var key in item) {
                if (key != 'uid') {
                    // values = values + key + `=` + `'` + item[key] + `'` + ',';
                    values = values + '"' + escape(key) + '"' + `=` + `'` + item[key] + `'` + ',';
                } else {
                    condition = key + `=` + `'` + item[key] + `'`
                }
            }
        })

        values = values.replace(/(^[,\s]+)|([,\s]+$)/g, '');

        console.log(values, "VALUES ");

        // let query1 = `UPDATE ${res.rows[0].tablename} SET ${values} WHERE ${condition};`
        let query1 = `UPDATE "${tablename}" SET ${values} WHERE ${condition};`

        let res1 = await queryExecute(query1);

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
            console.log(res);
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
            console.log(res);
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
            console.log(res);
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
            console.log(res.rows[0]);
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
    fetchCheckboxList: fetchCheckboxList
}