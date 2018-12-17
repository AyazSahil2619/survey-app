const squel = require('squel');
const runQuery = require('../pgConnection');


//  Database Query gets executed
async function queryExecute(query) {
    try {
        let result = await runQuery.pool.query(query);
        return result;
    } catch (err) {
        console.log(err, "ERROR");
        return Promise.reject(err)
    }
}




//  Creating TABLE in DATABASE And Inserting its Details into MASTERTABLE 
async function CreateTable(req, res) {

    console.log(req.body, "BODY");

    let query = '';
    let tablename = escape(req.body.tablename);
    let description = req.body.description;
    let user = req.body.currentUser;
    let fieldsData = [];

    // query = `CREATE TABLE IF NOT EXISTS "${tablename}" ();`
    query = `CREATE TABLE IF NOT EXISTS "${tablename}" (uid serial);`



    console.log(query, "QUERY")

    let query1 = squel
        .insert()
        .into("mastertable")
        .set("tablename", tablename)
        .set("\"Description\"", description)
        .set("createdby", user)
        .toString();

    console.log(query1, "QUERY!");



    try {
        let response = await queryExecute(query);
        let response1 = await queryExecute(query1);

        let query2 = squel
            .select()
            .field("id")
            .from("mastertable")
            .where("tablename =?", tablename)
            .toString();

        let response2 = await queryExecute(query2);

        // console.log(response2.rows, "RESPONSE 2");

        fieldsData.push({
            fieldname: 'uid',
            label: false,
            fieldtype: 'serial',
            Konstraint: false,
            tableid: response2.rows[0].id
        })

        let fieldstableQuery = squel
            .insert()
            .into("fieldstable")
            .setFieldsRows(fieldsData)
            .toString();

        let fieldstableResult = await queryExecute(fieldstableQuery);

        return response2.rows[0];

    } catch (err) {
        console.log(err, "Error while creating table");
        return Promise.reject(err.code)
    }

}


//  Adding Column to Table and data to (fieldstable and dropdowntable)

async function addColumn(req, res, id) {



    console.log(id, "BODY");

    console.log(req.body, "BODY");

    let body = [req.body];
    let fieldsData = [];
    let colquery = '';
    let constraints = '';
    let list = [];
    let fieldtype = req.body.type;


    let optionData = [];

    if (req.body.arrayList && req.body.arrayList.length > 0) {
        list = req.body.arrayList
    }


    if (list && list.length > 0) {
        list.forEach((item) => {
            optionData.push({
                databasevalue: item.databaseValue,
                displayvalue: item.displayValue,
                colname: req.body.colname,
                tableid: id,
            })

        })
    }


    let query = squel
        .select()
        .from("mastertable")
        .where("id=?", id)
        .toString();


    fieldsData.push({
        fieldname: escape(req.body.colname),
        label: escape(req.body.label),
        fieldtype: req.body.type,
        Konstraint: req.body.constraints,
        tableid: id
    })



    console.log(fieldsData, "FIELDSDATA")
    console.log(optionData, "    optionData")




    fieldsData.forEach((item) => {
        if (item.Konstraint == 'true') {
            constraints = constraints + ' ' + escape(item.fieldname) + ',';
        }
        if (item.fieldtype == 'dropdown' || item.fieldtype == 'radio') {
            colquery = colquery + 'ADD COLUMN' + ' ' + '"' + escape(item.fieldname) + '"' + ' ' + 'text' + ',';
        } else if (item.fieldtype == 'checkbox') {
            colquery = colquery + 'ADD COLUMN' + ' ' + '"' + escape(item.fieldname) + '"' + ' ' + 'text[]' + ',';
        } else {
            colquery = colquery + 'ADD COLUMN' + ' ' + '"' + escape(item.fieldname) + '"' + ' ' + item.fieldtype + ',';
        }
    })


    constraints = constraints.replace(/(^[,\s]+)|([,\s]+$)/g, '')
    colquery = colquery.replace(/(^[,\s]+)|([,\s]+$)/g, '');

    if (fieldsData.length != 0) {
        fieldstableQuery = squel
            .insert()
            .into("fieldstable")
            .setFieldsRows(fieldsData)
            .toString();
    }

    try {
        let response = await queryExecute(query);
        let fieldsDataResult;
        let tablename = response.rows[0].tablename;
        console.log(tablename, "TABLENAME");

        if (fieldsData.length != 0) {
            console.log("1111")
            let query1 = `ALTER TABLE "${tablename}" ${colquery} ;`
            console.log(query1, "QUERY");
            let addColumnResult = await queryExecute(query1);
            fieldsDataResult = await queryExecute(fieldstableQuery);

        }

        if (constraints) {
            console.log("2222")
            let constraintQuery = `ALTER TABLE "${tablename}" ADD PRIMARY KEY (${constraints});`
            console.log(constraintQuery, "CONSTRAINT QUERY")
            let constraintResult = await queryExecute(constraintQuery);
        }


        if (optionData && optionData.length > 0) {
            let query = squel
                .insert()
                .into(`${fieldtype}table`)
                .setFieldsRows(optionData)
                .toString();

            let result = await queryExecute(query);

        }

        return fieldsDataResult;

    } catch (err) {
        console.log(err, "ERROR");

        return Promise.reject(err);
    }
}




// Fetching DATA from MASTERTABLE

async function viewTable() {

    let query = squel
        .select()
        .from("mastertable")
        .toString();

    try {
        let resp = await queryExecute(query);
        let newArray = [];

        if (resp.rowCount > 0) {
            resp.rows.forEach((item) => {
                let datas = {};

                for (var key in item) {
                    if (key == 'tablename') {
                        datas[key] = unescape(item[key]);
                    } else {
                        datas[key] = item[key];
                    }
                }
                newArray.push(datas);
            });

            return newArray;
        } else {
            return Promise.reject({
                err: "Data not found"
            });
        }

    } catch (err) {
        return Promise.reject(err.message);
    }
}


// Deleting fields from fieldstable, row from mastertable and the table itself
async function deleteTable(id) {

    let query = squel
        .select()
        .from("mastertable")
        .where("id =?", id)
        .toString();

    let query1 = squel
        .delete()
        .from("mastertable")
        .where("id= ? ", id)
        .toString();

    let query3 = squel
        .delete()
        .from("fieldstable")
        .where("tableid= ? ", id)
        .toString();

    let query4 = squel
        .delete()
        .from("dropdowntable")
        .where("tableid= ? ", id)
        .toString();

    let query5 = squel
        .delete()
        .from("radiotable")
        .where("tableid= ? ", id)
        .toString();
    let query6 = squel
        .delete()
        .from("checkboxtable")
        .where("tableid= ? ", id)
        .toString();

    try {
        let resp = await queryExecute(query);
        let resp6 = await queryExecute(query6);
        let resp5 = await queryExecute(query5);
        let resp4 = await queryExecute(query4);
        let resp3 = await queryExecute(query3);
        let query2 = `DROP TABLE "${resp.rows[0].tablename}"`;
        let resp2 = await queryExecute(query2);
        let resp1 = await queryExecute(query1);

        if (resp1.rowCount > 0) {
            return;
        } else {
            return Promise.reject({
                err: "Table not found"
            });
        }

    } catch (err) {
        return Promise.reject(err.message);
    }

}

//DATA to COLUMNS (modified by AND modified at) is added

async function modifyTable(req, res, id) {

    let query = squel
        .update()
        .table('mastertable')
        .set('modifiedby', req.body.user)
        .set('modifiedat', req.body.time)
        .where('id=?', id)
        .toString();

    try {
        let resp = await queryExecute(query)
        return resp;
    } catch (err) {
        return Promise.reject(err);
    }
}


// Fetching Table Information  (is to be modified for editing table)

async function TableData(id) {

    let query = squel
        .select()
        .from("mastertable")
        .where("id =?", id)
        .toString();
    try {
        let resp = await queryExecute(query);
        let newArray = [];
        resp.rows.forEach((item) => {
            let datas = {};

            for (var key in item) {
                if (key == 'tablename') {
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




async function checkTablename(req, res) {

    let query = squel
        .select()
        .from("mastertable")
        .field("tablename")
        .toString();
    let check = true;

    try {
        let response = await queryExecute(query);

        response.rows.forEach((item, index) => {
            if (item.tablename === req.body.tablename) {
                check = false;
                return check;
            }
        });
        return check;

    } catch (err) {
        console.log(err);
        return Promise.reject(err)
    }

}


async function editTableInfo(req, res, id) {

    console.log(req.body, "BODY");
    console.log(id, "ID");

    let newData = req.body;

    let updateMastertableQuery = squel
        .update()
        .table('mastertable')
        .set('tablename', escape(newData.tablename))
        .set('"Description"', newData.description)
        .where('id=?', id)
        .toString();

    try {

        let response = await TableData(id);
        console.log(response[0], "RESPONSE")

        let oldTablename = escape(response[0].tablename);

        if (oldTablename != newData.tablename) {
            let query = `ALTER TABLE "${oldTablename}"  RENAME TO "${escape(newData.tablename)}";`
            let tableResult = await queryExecute(query);
        }

        let mastertableResult = await queryExecute(updateMastertableQuery);
        console.log(mastertableResult, "aaa")

        return mastertableResult;




    } catch (err) {
        console.log(err);
        return Promise.reject(err)
    }

}

async function check(req, res, id) {


    let query = squel
        .select()
        .from("mastertable")
        .field("id")
        .field("tablename")
        .toString();
    let check = true;

    try {
        let response = await queryExecute(query);

        response.rows.forEach((item, index) => {
            if (item.id != id) {
                if (item.tablename === req.body.tablename) {
                    check = false;
                    return check;
                }
            }
        });
        return check;

    } catch (err) {
        console.log(err);
        return Promise.reject(err)
    }

}

async function fetchFieldData(tableid, fieldid) {

    console.log(tableid, fieldid, "OOO");

    let query = `SELECT d.databasevalue AS d_dbvalue, d.displayvalue AS d_dspvalue,
     c.databasevalue AS c_dbvalue,c.displayvalue AS c_dspvalue,
     r.databasevalue AS r_dbvalue,r.displayvalue AS r_dspvalue,
     f.fieldname,f.fieldtype,f.label,f.tableid,f.konstraint,f.f_uid 
    FROM public.fieldstable AS f 
	FULL JOIN dropdowntable AS d ON d.tableid = f.tableid AND d.colname = f.fieldname 
    FULL JOIN radiotable AS r ON r.tableid = f.tableid AND r.colname = f.fieldname 
    FULL JOIN checkboxtable AS c ON c.tableid = f.tableid AND c.colname = f.fieldname where f.f_uid =${fieldid} ;`

    try {
        let response = await queryExecute(query);
        let newArray = [];

        // console.log(response.rows);

        response.rows.forEach((item) => {
            let datas = {};

            for (var key in item) {
                if (item[key] != null) {
                    datas[key] = unescape(item[key]);
                }
            }
            newArray.push(datas);

        })

        console.log(newArray, "NEW ARRAY");

        return newArray;
        // return response.rows;

    } catch (err) {
        console.log(err);
        return Promise.reject(err)
    }

}

async function fieldEdit(req, table_id, field_id) {

    console.log(table_id, "tableID");
    console.log(field_id, "Field id");
    console.log(req.body, "Body");

    // let body = [req.body];
    let colquery = '';

    let optionList = [];
    let optionData = [];

    if (req.body.List && req.body.List.length > 0) {
        optionList = req.body.List;
    }

    let new_fieldname = escape(req.body.colname);
    let new_fieldtype;

    if (req.body.type == 'dropdown' || req.body.type == 'radio') {
        new_fieldtype = 'text';
    } else if (req.body.type = 'checkbox') {
        new_fieldtype = 'text[]';
    } else {
        new_fieldtype = req.body.type;
    }

    let new_label = req.body.label;
    let new_konstraint = req.body.constraints;



    if (optionList.length > 0) {

        optionList.forEach((item) => {
            optionData.push({
                databasevalue: item.databaseValue,
                displayvalue: item.displayValue,
                colname: new_fieldname,
                tableid: table_id,
            })
        })

        console.log(optionList, "optionList");
        console.log(optionData, "optionData");

    }


    let query = squel
        .select()
        .field("tablename")
        .from("mastertable")
        .where("id =?", table_id)
        .toString();

    let query1 = squel
        .select()
        .from("fieldstable")
        .where("f_uid =?", field_id)
        .toString();

    let query4 = squel
        .update()
        .table("fieldstable")
        .set("fieldname", new_fieldname)
        .set("fieldtype", req.body.type)
        .set("label", new_label)
        .set("konstraint", new_konstraint)
        .where("f_uid = ?", field_id)
        .toString()


    console.log(query4, "QUERY 4")


    try {
        let response = await queryExecute(query);
        let response1 = await queryExecute(query1);
        let tablename = unescape(response.rows[0].tablename);
        let prv_fieldname = unescape(response1.rows[0].fieldname);
        let prv_fieldtype = response1.rows[0].fieldtype;

        let query2 = ` ALTER TABLE "${tablename}" ALTER COLUMN "${prv_fieldname}" SET DATA TYPE ${new_fieldtype};`
        console.log(query2, "QUERY 2");
        let response2 = await queryExecute(query2);
        console.log(response2, "RESPONSE2");

        if (prv_fieldname != new_fieldname) {
            let query3 = `ALTER TABLE "${tablename}"  RENAME COLUMN "${prv_fieldname}" TO "${new_fieldname}"`
            console.log(query3, "QUERY 3");
            let response3 = await queryExecute(query3);
            console.log(response3, "RESPONSE3");
        }

        if (new_konstraint == true) {
            console.log(new_konstraint, "IN HERE");
            let query5 = `ALTER TABLE "${tablename}" ADD PRIMARY KEY ("${new_fieldname}")`
            let response5 = await queryExecute(query5);
        }


        console.log(prv_fieldtype, "PREVIOUS FIELD TYPE");

        if (prv_fieldtype == 'dropdown' || prv_fieldtype == 'radio' || prv_fieldtype == 'checkbox') {

            let query6 = squel
                .delete()
                .from(`${prv_fieldtype}table`)
                .where("tableid = ?", table_id)
                .where("colname = ?", prv_fieldname)
                .toString()

            console.log(query6, "QUERY6");
            let response6 = await queryExecute(query6);

        }

        if (optionData.length > 0) {
            let query7 = squel
                .insert()
                .into(`${req.body.type}table`)
                .setFieldsRows(optionData)
                .toString();

            console.log(query7, "QUERY7");

            let response7 = await queryExecute(query7);
        }


        let response4 = await queryExecute(query4);

        return response4;

    } catch (err) {
        console.log(err);
        return Promise.reject(err)
    }

}


async function fieldDelete(tableid, fieldid) {
    console.log("HERE");

    console.log(tableid, fieldid, "OOO");

    let query = squel
        .select()
        .from("fieldstable")
        .where("tableid =?", tableid)
        .where("f_uid =?", fieldid)
        .toString();
    try {

        let resp = await TableData(tableid);
        let tablename = escape(resp[0].tablename);

        let response = await queryExecute(query);

        let fieldname = response.rows[0].fieldname;
        let fieldtype = response.rows[0].fieldtype;

        if (fieldtype == 'dropdown' || fieldtype == 'radio' || fieldtype == 'checkbox') {
            let query1 = squel
                .delete()
                .from(`${fieldtype}table`)
                .where("tableid =?", tableid)
                .where("colname =?", fieldname)
                .toString();

            let response1 = await queryExecute(query1);
        }

        let query2 = squel
            .delete()
            .from("fieldstable")
            .where("tableid =?", tableid)
            .where("f_uid =?", fieldid)
            .toString();

        let response2 = await queryExecute(query2);

        let query3 = `ALTER TABLE "${tablename}" DROP COLUMN IF EXISTS "${escape(fieldname)}" ; `
        console.log(query3, "QUERY3");
        let response3 = await queryExecute(query3);

        return response3;

    } catch (err) {
        console.log(err);
        return Promise.reject(err)
    }

}

module.exports = {
    CreateTable: CreateTable,
    viewTable: viewTable,
    deleteTable: deleteTable,
    modifyTable: modifyTable,
    TableData: TableData,
    // editTable: editTable,
    checkTablename: checkTablename,
    addColumn: addColumn,
    editTableInfo: editTableInfo,
    check: check,
    fetchFieldData: fetchFieldData,
    fieldEdit: fieldEdit,
    fieldDelete: fieldDelete
}
















// ADD COLUMN================

// async function addColumn(req, res, id) {

//     let fieldsData = [];
//     let dropdownData = [];
//     let colquery = '';
//     let constraints = '';

//     let deletefield = [];
//     let deleteColumn = '';

//     let radioData = [];
//     let fieldstableQuery;

//     let checkboxData = [];

//     let query = squel
//         .select()
//         .from("mastertable")
//         .where("id=?", id)
//         .toString();


//     console.log(req.body, "BODY");

//     req.body.forEach((item) => {

//         let data = {};
//         let data1 = {};
//         let data2 = {};
//         let data3 = {};

//         for (var key in item) {
//             if (key == 'colname' || key == 'label' || key == 'type' || key == 'constraints') {
//                 data = {
//                     fieldname: escape(item.colname),
//                     label: escape(item.label),
//                     fieldtype: item.type,
//                     Konstraint: item.constraints,
//                     tableid: id
//                 }
//             } else if (key == 'dbValue' || key == 'dspValue' || key == 'fieldname') {
//                 data1 = {
//                     databasevalue: item.dbValue,
//                     displayvalue: item.dspValue,
//                     colname: item.fieldname,
//                     tableid: id,

//                 }
//             }
//             // else if (key == 'deletefield') {
//             //     deleteColumn = deleteColumn + 'DROP COLUMN IF EXISTS' + ' ' + '"' + escape(item.deletefield) + '"' + ','
//             //     deletefield.push({
//             //         colname: item.deletefield
//             //     })
//             // } 
//             else if (key == 'r_dbValue' || key == 'r_dspValue' || key == 'r_fieldname') {
//                 data2 = {
//                     databasevalue: item.r_dbValue,
//                     displayvalue: item.r_dspValue,
//                     colname: item.r_fieldname,
//                     tableid: id,

//                 }
//             } else if (key == 'c_dbValue' || key == 'c_dspValue' || key == 'c_fieldname') {
//                 data3 = {
//                     databasevalue: item.c_dbValue,
//                     displayvalue: item.c_dspValue,
//                     colname: item.c_fieldname,
//                     tableid: id,
//                 }
//             }

//         }

//         if (Object.keys(data).length != 0) {
//             fieldsData.push(data);
//         }
//         if (Object.keys(data1).length != 0) {
//             dropdownData.push(data1);
//         }
//         if (Object.keys(data2).length != 0) {
//             radioData.push(data2);
//         }
//         if (Object.keys(data3).length != 0) {
//             checkboxData.push(data3);
//         }
//     })


//     // console.log(deletefield, "DELETEFIELD");
//     // console.log(deleteColumn, "DELETE COLUMN");

//     console.log(fieldsData, "FIELDSDATA")
//     console.log(dropdownData, "DROPDOWNDATA")
//     console.log(radioData, "RADIO DATA");
//     console.log(checkboxData, "CHECK BOX DATA");


//     fieldsData.forEach((item) => {
//         if (item.Konstraint == 'true') {
//             constraints = constraints + ' ' + escape(item.fieldname) + ',';
//         }
//         if (item.fieldtype == 'dropdown' || item.fieldtype == 'radio') {
//             colquery = colquery + 'ADD COLUMN' + ' ' + '"' + escape(item.fieldname) + '"' + ' ' + 'text' + ',';
//         } else if (item.fieldtype == 'checkbox') {
//             colquery = colquery + 'ADD COLUMN' + ' ' + '"' + escape(item.fieldname) + '"' + ' ' + 'text[]' + ',';
//         } else {
//             colquery = colquery + 'ADD COLUMN' + ' ' + '"' + escape(item.fieldname) + '"' + ' ' + item.fieldtype + ',';
//         }
//     })

//     // colquery = colquery + 'ADD COLUMN' + 'uid SERIAL' + ',';

//     constraints = constraints.replace(/(^[,\s]+)|([,\s]+$)/g, '')
//     colquery = colquery.replace(/(^[,\s]+)|([,\s]+$)/g, '');

//     if (fieldsData.length != 0) {
//         fieldstableQuery = squel
//             .insert()
//             .into("fieldstable")
//             .setFieldsRows(fieldsData)
//             .toString();
//     }

//     try {
//         let response = await queryExecute(query);
//         let fieldsDataResult;
//         let tablename = response.rows[0].tablename;
//         console.log(tablename, "TABLENAME");

//         if (fieldsData.length != 0) {
//             console.log("1111")
//             let query1 = `ALTER TABLE "${tablename}" ${colquery} ;`
//             console.log(query1, "QUERY");
//             let addColumnResult = await queryExecute(query1);
//             fieldsDataResult = await queryExecute(fieldstableQuery);

//         }

//         if (constraints) {
//             console.log("2222")
//             let constraintQuery = `ALTER TABLE "${tablename}" ADD PRIMARY KEY (${constraints});`
//             console.log(constraintQuery, "CONSTRAINT QUERY")
//             let constraintResult = await queryExecute(constraintQuery);
//         }


//         if (dropdownData.length != 0) {
//             console.log("333")

//             console.log(dropdownData, "DROP DOWN")

//             let dropdownQuery = squel
//                 .insert()
//                 .into("dropdowntable")
//                 .setFieldsRows(dropdownData)
//                 .toString();
//             console.log(dropdownQuery, "QUERY");
//             let dropdownResult = await queryExecute(dropdownQuery);

//             console.log(dropdownResult, "dropdown")
//         }


//         if (radioData.length != 0) {
//             console.log("4444")

//             console.log(radioData, "radio")

//             let radioQuery = squel
//                 .insert()
//                 .into("radiotable")
//                 .setFieldsRows(radioData)
//                 .toString();

//             let radioResult = await queryExecute(radioQuery);

//             console.log(radioResult, "radio")
//         }


//         if (checkboxData.length != 0) {
//             console.log("333")

//             console.log(checkboxData, "DROP DOWN")

//             let checkboxQuery = squel
//                 .insert()
//                 .into("checkboxtable")
//                 .setFieldsRows(checkboxData)
//                 .toString();
//             console.log(checkboxQuery, "QUERY");
//             let checkboxResult = await queryExecute(checkboxQuery);

//             console.log(checkboxResult, "checkbox")
//         }

//         // if (deletefield.length != 0) {
//         //     console.log("5555")

//         //     deleteColumn = deleteColumn.replace(/(^[,\s]+)|([,\s]+$)/g, '');

//         //     let deletequery = `ALTER TABLE "${tablename}" ${deleteColumn};`
//         //     console.log(deletequery, "query");
//         //     let deleteResult = await queryExecute(deletequery);

//         //     deletefield.forEach((item) => {
//         //         let query = squel
//         //             .delete()
//         //             .from("fieldstable")
//         //             .where("fieldname= ?", item.colname)
//         //             .where("tableid= ?", id)
//         //             .toString();
//         //         let response5 = queryExecute(query);
//         //     })

//         //     deletefield.forEach((item) => {
//         //         let query = squel
//         //             .delete()
//         //             .from("dropdowntable")
//         //             .where("colname= ?", item.colname)
//         //             .where("tableid= ?", id)
//         //             .toString();
//         //         let response5 = queryExecute(query);
//         //     })
//         //     deletefield.forEach((item) => {
//         //         let query = squel
//         //             .delete()
//         //             .from("radiotable")
//         //             .where("colname= ?", item.colname)
//         //             .where("tableid= ?", id)
//         //             .toString();
//         //         let response5 = queryExecute(query);
//         //     })
//         //     deletefield.forEach((item) => {
//         //         let query = squel
//         //             .delete()
//         //             .from("checkboxtable")
//         //             .where("colname= ?", item.colname)
//         //             .where("tableid= ?", id)
//         //             .toString();
//         //         let response5 = queryExecute(query);
//         //     })
//         // }
//         return fieldsDataResult;

//     } catch (err) {
//         console.log(err, "ERROR");

//         return Promise.reject(err);
//     }
// }

















































// ============================= Editing Existing Table

// async function editTable(req, res, id) {

//     console.log(id, "ID");
//     console.log(req.body, "BODY");


//     let fieldsData = [];
//     let newfieldsData = [];
//     let constraint = '';

//     let newData = {};
//     let columnQuery = '';
//     let deleteColumn = '';
//     let deletecolumnArray = [];

//     let dropdownData = [];
//     let ddInfo = req.body.ddlist;

//     let changed = false;

//     if (ddInfo.length != 0) {

//         ddInfo.forEach((item, index) => {
//             for (var key in item) {
//                 if (key != 'colname') {
//                     dropdownData.push({
//                         options: item[key],
//                         colname: item.colname
//                     })
//                 }
//             }
//         })
//     }

//     console.log(dropdownData, "Dropdowndata");


//     req.body.columnList.forEach((item, index) => {
//         for (var key in item) {
//             if (key == 'tablename' || key == 'Description') {
//                 newData = {
//                     tablename: escape(item.tablename),
//                     Description: item.Description
//                 }
//             }
//             //  else {
//             //     if (key == 'deletefield') {
//             //         deleteColumn = deleteColumn + 'DROP COLUMN' + ' ' + '"' + escape(item.deletefield) + '"' + ','
//             //     }
//             // }
//         }
//     })

//     console.log(req.body.deleteArray, "lllllllll");

//     req.body.deleteArray.forEach((item) => {
//         console.log("lllllllaaaaaaall");

//         for (var key in item) {
//             if (key == 'deletefield') {
//                 deleteColumn = deleteColumn + 'DROP COLUMN' + ' ' + '"' + escape(item.deletefield) + '"' + ','
//             } else if (item.deletefieldtype == 'dropdown') {
//                 deletecolumnArray.push({
//                     colname: item.deletefield
//                 })
//             }
//         }

//     })

//     console.log(deletecolumnArray, "ARRRAAAYYY");

//     req.body.columnList.forEach((item, index) => {

//         let data = {};
//         let newdata = {};

//         for (var key in item) {
//             if (key == 'fieldname' || key == 'label' || key == 'fieldtype' || key == 'konstraint') {

//                 data[key] = escape(item[key]);

//             } else if (key == 'newfieldname' || key == 'newlabel' || key == 'newfieldtype' || key == 'newkonstraint') {

//                 newdata[key] = item[key];

//             }
//         }
//         if (Object.keys(data).length != 0)
//             fieldsData.push(data);

//         if (Object.keys(newdata).length != 0)
//             newfieldsData.push(newdata);
//     })

//     console.log(newfieldsData, "NEW");

//     newfieldsData.forEach((item) => {
//         if (item.newkonstraint) {
//             // columnQuery = columnQuery + 'ADD COLUMN' + ' ' + '"' + escape(item.newfieldname) + '"' + ' ' +
//             // item.newfieldtype + ' ' + 'PRIMARY KEY' + ' ' + ','
//             columnQuery = columnQuery + 'ADD COLUMN' + ' ' + '"' + escape(item.newfieldname) + '"' + ' ' +
//                 item.newfieldtype + ','

//             constraint = constraint + ' ' + '"' + escape(item.newfieldname) + '"' + ','

//         } else {

//             if (item.newfieldtype == 'dropdown') {
//                 columnQuery = columnQuery + 'ADD COLUMN' + ' ' + '"' + escape(item.newfieldname) + '"' + ' ' + 'text' + ','
//             } else {
//                 columnQuery = columnQuery + 'ADD COLUMN' + ' ' + '"' + escape(item.newfieldname) + '"' + ' ' + item.newfieldtype + ','
//             }
//         }
//         for (var key in item) {
//             if (key == 'newfieldname' || key == 'newlabel' || key == 'newfieldtype' || key == 'newkonstraint') {

//                 data = {
//                     fieldname: escape(item.newfieldname),
//                     label: escape(item.newlabel),
//                     fieldtype: item.newfieldtype,
//                     konstraint: item.newkonstraint
//                 }
//             }
//         }
//         if (Object.keys(data).length != 0)
//             fieldsData.push(data);

//     })

//     fieldsData.forEach((field) => {
//         field.tableid = id;
//     })


//     constraint = constraint.replace(/(^[,\s]+)|([,\s]+$)/g, '')
//     columnQuery = columnQuery.replace(/(^[,\s]+)|([,\s]+$)/g, '');
//     deleteColumn = deleteColumn.replace(/(^[,\s]+)|([,\s]+$)/g, '');

//     console.log(deleteColumn, " COLUMN DELETE ");
//     console.log(columnQuery, "columnQuery");
//     console.log(fieldsData, "Fields data");
//     console.log(newData, " Table description ");
//     console.log(constraint, "CONSTRAINTS");

//     let updateMastertableQuery = squel
//         .update()
//         .table('mastertable')
//         .set('tablename', newData.tablename)
//         .set('"Description"', newData.Description)
//         .where('id=?', id)
//         .toString();

//     console.log(updateMastertableQuery, "*")

//     let deleteOldDataQuery = squel
//         .delete()
//         .from("fieldstable")
//         .where("tableid= ? ", id)
//         .where("fieldname <>  ?", 'uid')
//         .toString();

//     console.log(deleteOldDataQuery, "**");

//     // console.log(fieldsData, "++++++")


//     let fieldstableQuery = squel
//         .insert()
//         .into("fieldstable")
//         .setFieldsRows(fieldsData)
//         .toString();

//     console.log(fieldstableQuery, "***");

//     try {
//         // console.log("TRY", id)
//         let response = await TableData(id);
//         // console.log("RESPONSE");
//         // console.log(response)


//         let tablename = escape(response[0].tablename);
//         let description = response[0].Description;

//         console.log(tablename, description, "===")
//         // console.log(columnQuery, "COLUMNQUERY");

//         let mastertableResult;
//         let fieldstableResult;

//         if (tablename != newData.tablename) {
//             let query = `ALTER TABLE "${tablename}"  RENAME TO "${newData.tablename}";`
//             // console.log(query);
//             let tableResult = await queryExecute(query);
//             mastertableResult = await queryExecute(updateMastertableQuery);
//             changed = true;
//         }

//         if (description != newData.Description) {
//             // console.log(description, "in")
//             mastertableResult = await queryExecute(updateMastertableQuery);
//             changed = true;
//         }

//         if (deleteColumn) {
//             let deleteColumnQuery = `ALTER TABLE "${newData.tablename}" ${deleteColumn};`
//             console.log(deleteColumnQuery, "deletecolumnQuery");
//             deleteColumnResult = await queryExecute(deleteColumnQuery);
//             let deleteResult = await queryExecute(deleteOldDataQuery);
//             fieldstableResult = await queryExecute(fieldstableQuery);

//             changed = true;
//         }

//         if (columnQuery) {

//             let alterColumnQuery = `ALTER TABLE "${newData.tablename}" ${columnQuery} ;`
//             console.log(alterColumnQuery, "QUERY");
//             let columnResult = await queryExecute(alterColumnQuery);

//             if (constraint) {
//                 let constraintQuery = `ALTER TABLE "${newData.tablename}" ADD PRIMARY KEY (${constraint});`
//                 console.log(constraintQuery, "QURRYYYYYYYYYYYY")
//                 let constraintResult = await queryExecute(constraintQuery);
//             }

//             let deleteResult = await queryExecute(deleteOldDataQuery);
//             fieldstableResult = await queryExecute(fieldstableQuery);

//             changed = true;
//         }

//         if (deletecolumnArray.length != 0) {
//             console.log(deletecolumnArray, "11111");

//             deletecolumnArray.forEach((item) => {
//                 let query5 = squel
//                     .delete()
//                     .from("dropdowntable")
//                     .where("colname= ?", item.colname)
//                     .toString();
//                 console.log(query5, "QUERY 5")

//                 let response5 = queryExecute(query5);
//             })

//         }


//         if (dropdownData.length > 0) {

//             dropdownData.forEach((field) => {
//                 field.tableid = id;
//             })
//             let dropdownQuery = squel
//                 .insert()
//                 .into("dropdowntable")
//                 .setFieldsRows(dropdownData)
//                 .toString();

//             let dropdowntableResult = await queryExecute(dropdownQuery);
//         }

//         return changed;

//     } catch (err) {
//         console.log(err, "1234");
//         return Promise.reject(err);
//     }
// }

// ==========CREATE TABLE PART

// async function CreateTable(req, res) {

//     let colquery = '';
//     let fieldsData = [];
//     let ColInfo = req.body.ColInfo;
//     let constraints = '';
//     let query = '';

//     let dropdownData = [];
//     let ddInfo = req.body.ddlist;

//     // console.log(ColInfo,"column info");

//     // console.log(ddInfo,"DD INFO");

//     console.log(req.body, "BODY");

//     if (ddInfo.length != 0) {

//         ddInfo.forEach((item, index) => {
//             for (var key in item) {
//                 if (key != 'colname') {
//                     dropdownData.push({
//                         options: item[key],
//                         colname: item.colname
//                     })
//                 }
//             }
//         })
//     }

//     console.log(dropdownData, "Dropdowndata");

//     ColInfo.forEach((item, index) => {
//         if (item.constraint) {
//             // constraints = constraints + ' ' + item.name + ',';
//             constraints = constraints + ' ' + '"' + escape(item.name) + '"' + ',';

//             fieldsData.push({
//                 fieldname: escape(item.name),
//                 label: escape(item.label),
//                 fieldtype: item.type,
//                 Konstraint: true
//             })
//         } else {
//             fieldsData.push({
//                 fieldname: escape(item.name),
//                 label: escape(item.label),
//                 fieldtype: item.type,
//                 Konstraint: false
//             })
//         }
//         if (item.type == 'dropdown') {
//             colquery = colquery + ' ' + '"' + escape(item.name) + '"' + ' ' + 'text' + ',';
//         } else {
//             colquery = colquery + ' ' + '"' + escape(item.name) + '"' + ' ' + item.type + ',';
//         }
//     });

//     fieldsData.push({
//         fieldname: 'uid',
//         label: false,
//         fieldtype: 'serial',
//         Konstraint: false
//     })

//     colquery = colquery + 'uid SERIAL' + ',';

//     constraints = constraints.replace(/(^[,\s]+)|([,\s]+$)/g, '');
//     let tablename = escape(req.body.tablename);

//     console.log(colquery, "colquery")

//     if (constraints) {
//         // query = `CREATE TABLE IF NOT EXISTS ${req.body.tablename} (${colquery} PRIMARY KEY (${constraints}));`
//         // query = `CREATE TABLE IF NOT EXISTS "${req.body.tablename}" (${colquery} PRIMARY KEY (${constraints}));`
//         query = `CREATE TABLE IF NOT EXISTS "${tablename}" (${colquery} PRIMARY KEY (${constraints}));`

//     } else {
//         colquery = colquery.replace(/(^[,\s]+)|([,\s]+$)/g, '');
//         // query = `CREATE TABLE IF NOT EXISTS ${req.body.tablename} (${colquery});`
//         // query = `CREATE TABLE IF NOT EXISTS "${req.body.tablename}" (${colquery});`
//         query = `CREATE TABLE IF NOT EXISTS "${tablename}" (${colquery});`

//     }

//     console.log(query, "QUERY")

//     let query1 = squel
//         .insert()
//         .into("mastertable")
//         // tablename in place of req.body.tablename
//         .set("tablename", tablename)
//         .set("createdby", req.body.currentUser)
//         .set("\"Description\"", req.body.description)
//         .toString();

//     console.log(query1, "QUERY!");

//     try {
//         let response = await queryExecute(query);
//         console.log(response, "RESPONSE00");
//         let response1 = await queryExecute(query1);
//         console.log(response1, "RESPONSE0011");
//         let query2 = squel
//             .select()
//             .from("mastertable")
//             // tablename in place of req.body.tablename
//             .where("tablename =?", tablename)
//             .toString();

//         let response2 = await queryExecute(query2);


//         fieldsData.forEach((field) => {
//             field.tableid = response2.rows[0].id
//         });

//         dropdownData.forEach((field) => {
//             field.tableid = response2.rows[0].id
//         })

//         console.log(dropdownData, "DDDDDD");

//         let query3 = squel
//             .insert()
//             .into("fieldstable")
//             .setFieldsRows(fieldsData)
//             .toString();

//         let response3 = await queryExecute(query3);

//         console.log(response3, "RESPONSE3");

//         if (dropdownData.length != 0) {

//             console.log(dropdownData, "12345");

//             dropdownData.forEach((field) => {
//                 field.tableid = response2.rows[0].id
//             })

//             console.log(dropdownData, "DROP DOWN")

//             let query4 = squel
//                 .insert()
//                 .into("dropdowntable")
//                 .setFieldsRows(dropdownData)
//                 .toString();

//             let response4 = await queryExecute(query4);

//             console.log(response4, "11")
//         }


//         return response;

//     } catch (err) {
//         return Promise.reject(err.code)
//     }

// }