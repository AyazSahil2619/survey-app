const squel = require('squel');
const runQuery = require('../pgConnection');

//  Database Query gets executed
async function queryExecute(query) {
    try {
        let result = await runQuery.pool.query(query);
        // console.log(result, "RESULT");
        return result;
    } catch (err) {
        console.log(err, "EROR");
        return Promise.reject(err)
    }
}
//  Creating TABLE in DATABASE And Inserting its Details into MASTERTABLE AND FIELDSTABLE

async function CreateTable(req, res) {

    let colquery = '';
    let fieldsData = [];
    let ColInfo = req.body.ColInfo;
    let constraints = '';
    let query = '';

    let dropdownData = [];
    let ddInfo = req.body.ddlist;

    // console.log(ColInfo,"column info");

    // console.log(ddInfo,"DD INFO");

    console.log(req.body, "BODY");

    if (ddInfo.length != 0) {

        ddInfo.forEach((item, index) => {
            for (var key in item) {
                if (key != 'colname') {
                    dropdownData.push({
                        options: item[key],
                        colname: item.colname
                    })
                }
            }
        })
    }

    console.log(dropdownData, "Dropdowndata");

    ColInfo.forEach((item, index) => {
        if (item.constraint) {
            // constraints = constraints + ' ' + item.name + ',';
            constraints = constraints + ' ' + '"' + escape(item.name) + '"' + ',';

            fieldsData.push({
                fieldname: escape(item.name),
                label: escape(item.label),
                fieldtype: item.type,
                Konstraint: true
            })
        } else {
            fieldsData.push({
                fieldname: escape(item.name),
                label: escape(item.label),
                fieldtype: item.type,
                Konstraint: false
            })
        }
        if (item.type == 'dropdown') {
            colquery = colquery + ' ' + '"' + escape(item.name) + '"' + ' ' + 'text' + ',';
        } else {
            colquery = colquery + ' ' + '"' + escape(item.name) + '"' + ' ' + item.type + ',';
        }
    });

    fieldsData.push({
        fieldname: 'uid',
        label: false,
        fieldtype: 'serial',
        Konstraint: false
    })

    colquery = colquery + 'uid SERIAL' + ',';

    constraints = constraints.replace(/(^[,\s]+)|([,\s]+$)/g, '');
    let tablename = escape(req.body.tablename);

    console.log(colquery, "colquery")

    if (constraints) {
        // query = `CREATE TABLE IF NOT EXISTS ${req.body.tablename} (${colquery} PRIMARY KEY (${constraints}));`
        // query = `CREATE TABLE IF NOT EXISTS "${req.body.tablename}" (${colquery} PRIMARY KEY (${constraints}));`
        query = `CREATE TABLE IF NOT EXISTS "${tablename}" (${colquery} PRIMARY KEY (${constraints}));`

    } else {
        colquery = colquery.replace(/(^[,\s]+)|([,\s]+$)/g, '');
        // query = `CREATE TABLE IF NOT EXISTS ${req.body.tablename} (${colquery});`
        // query = `CREATE TABLE IF NOT EXISTS "${req.body.tablename}" (${colquery});`
        query = `CREATE TABLE IF NOT EXISTS "${tablename}" (${colquery});`

    }

    console.log(query, "QUERY")

    let query1 = squel
        .insert()
        .into("mastertable")
        // tablename in place of req.body.tablename
        .set("tablename", tablename)
        .set("createdby", req.body.currentUser)
        .set("\"Description\"", req.body.description)
        .toString();

    console.log(query1, "QUERY!");

    try {
        let response = await queryExecute(query);
        console.log(response, "RESPONSE00");
        let response1 = await queryExecute(query1);
        console.log(response1, "RESPONSE0011");
        let query2 = squel
            .select()
            .from("mastertable")
            // tablename in place of req.body.tablename
            .where("tablename =?", tablename)
            .toString();

        let response2 = await queryExecute(query2);


        fieldsData.forEach((field) => {
            field.tableid = response2.rows[0].id
        });

        dropdownData.forEach((field) => {
            field.tableid = response2.rows[0].id
        })

        console.log(dropdownData, "DDDDDD");

        let query3 = squel
            .insert()
            .into("fieldstable")
            .setFieldsRows(fieldsData)
            .toString();

        let response3 = await queryExecute(query3);

        console.log(response3, "RESPONSE3");

        if (dropdownData.length != 0) {

            console.log(dropdownData, "12345");

            dropdownData.forEach((field) => {
                field.tableid = response2.rows[0].id
            })

            console.log(dropdownData, "DROP DOWN")

            let query4 = squel
                .insert()
                .into("dropdowntable")
                .setFieldsRows(dropdownData)
                .toString();

            let response4 = await queryExecute(query4);

            console.log(response4, "11")
        }


        return response;

    } catch (err) {
        return Promise.reject(err.code)
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

    try {
        let resp = await queryExecute(query);
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


// ============================= Editing Existing Table

async function editTable(req, res, id) {

    console.log(id, "ID");
    console.log(req.body, "BODY");


    let fieldsData = [];
    let newfieldsData = [];
    let constraint = '';

    let newData = {};
    let columnQuery = '';
    let deleteColumn = '';
    let deletecolumnArray = [];

    let dropdownData = [];
    let ddInfo = req.body.ddlist;

    let changed = false;

    if (ddInfo.length != 0) {

        ddInfo.forEach((item, index) => {
            for (var key in item) {
                if (key != 'colname') {
                    dropdownData.push({
                        options: item[key],
                        colname: item.colname
                    })
                }
            }
        })
    }

    console.log(dropdownData, "Dropdowndata");


    req.body.columnList.forEach((item, index) => {
        for (var key in item) {
            if (key == 'tablename' || key == 'Description') {
                newData = {
                    tablename: escape(item.tablename),
                    Description: item.Description
                }
            }
            //  else {
            //     if (key == 'deletefield') {
            //         deleteColumn = deleteColumn + 'DROP COLUMN' + ' ' + '"' + escape(item.deletefield) + '"' + ','
            //     }
            // }
        }
    })

    console.log(req.body.deleteArray, "lllllllll");

    req.body.deleteArray.forEach((item) => {
        console.log("lllllllaaaaaaall");

        for (var key in item) {
            if (key == 'deletefield') {
                deleteColumn = deleteColumn + 'DROP COLUMN' + ' ' + '"' + escape(item.deletefield) + '"' + ','
            } else if (item.deletefieldtype == 'dropdown') {
                deletecolumnArray.push({
                    colname: item.deletefield
                })
            }
        }

    })

    console.log(deletecolumnArray, "ARRRAAAYYY");

    req.body.columnList.forEach((item, index) => {

        let data = {};
        let newdata = {};

        for (var key in item) {
            if (key == 'fieldname' || key == 'label' || key == 'fieldtype' || key == 'konstraint') {

                data[key] = item[key]

            } else if (key == 'newfieldname' || key == 'newlabel' || key == 'newfieldtype' || key == 'newkonstraint') {

                newdata[key] = item[key];

            }
        }
        if (Object.keys(data).length != 0)
            fieldsData.push(data);

        if (Object.keys(newdata).length != 0)
            newfieldsData.push(newdata);
    })

    console.log(newfieldsData, "NEW");

    newfieldsData.forEach((item) => {
        if (item.newkonstraint) {
            // columnQuery = columnQuery + 'ADD COLUMN' + ' ' + '"' + escape(item.newfieldname) + '"' + ' ' +
            // item.newfieldtype + ' ' + 'PRIMARY KEY' + ' ' + ','
            columnQuery = columnQuery + 'ADD COLUMN' + ' ' + '"' + escape(item.newfieldname) + '"' + ' ' +
                item.newfieldtype + ','

            constraint = constraint + ' ' + '"' + escape(item.newfieldname) + '"' + ','

        } else {

            if (item.newfieldtype == 'dropdown') {
                columnQuery = columnQuery + 'ADD COLUMN' + ' ' + '"' + escape(item.newfieldname) + '"' + ' ' + 'text' + ','
            } else {
                columnQuery = columnQuery + 'ADD COLUMN' + ' ' + '"' + escape(item.newfieldname) + '"' + ' ' + item.newfieldtype + ','
            }
        }
        for (var key in item) {
            if (key == 'newfieldname' || key == 'newlabel' || key == 'newfieldtype' || key == 'newkonstraint') {

                data = {
                    fieldname: escape(item.newfieldname),
                    label: item.newlabel,
                    fieldtype: item.newfieldtype,
                    konstraint: item.newkonstraint
                }
            }
        }
        if (Object.keys(data).length != 0)
            fieldsData.push(data);

    })

    fieldsData.forEach((field) => {
        field.tableid = id;
    })


    constraint = constraint.replace(/(^[,\s]+)|([,\s]+$)/g, '')
    columnQuery = columnQuery.replace(/(^[,\s]+)|([,\s]+$)/g, '');
    deleteColumn = deleteColumn.replace(/(^[,\s]+)|([,\s]+$)/g, '');

    console.log(deleteColumn, " COLUMN DELETE ");
    console.log(columnQuery, "columnQuery");
    console.log(fieldsData, "Fields data");
    console.log(newData, " Table description ");
    console.log(constraint, "CONSTRAINTS");

    let updateMastertableQuery = squel
        .update()
        .table('mastertable')
        .set('tablename', newData.tablename)
        .set('"Description"', newData.Description)
        .where('id=?', id)
        .toString();

    console.log(updateMastertableQuery, "*")

    let deleteOldDataQuery = squel
        .delete()
        .from("fieldstable")
        .where("tableid= ? ", id)
        .where("fieldname <>  ?", 'uid')
        .toString();

    console.log(deleteOldDataQuery, "**");

    // console.log(fieldsData, "++++++")


    let fieldstableQuery = squel
        .insert()
        .into("fieldstable")
        .setFieldsRows(fieldsData)
        .toString();

    console.log(fieldstableQuery, "***");

    try {
        // console.log("TRY", id)
        let response = await TableData(id);
        // console.log("RESPONSE");
        // console.log(response)


        let tablename = escape(response[0].tablename);
        let description = response[0].Description;

        console.log(tablename, description, "===")
        // console.log(columnQuery, "COLUMNQUERY");

        let mastertableResult;
        let fieldstableResult;

        if (tablename != newData.tablename) {
            let query = `ALTER TABLE "${tablename}"  RENAME TO "${newData.tablename}";`
            // console.log(query);
            let tableResult = await queryExecute(query);
            mastertableResult = await queryExecute(updateMastertableQuery);
            changed = true;
        }

        if (description != newData.Description) {
            // console.log(description, "in")
            mastertableResult = await queryExecute(updateMastertableQuery);
            changed = true;
        }

        if (deleteColumn) {
            let deleteColumnQuery = `ALTER TABLE "${newData.tablename}" ${deleteColumn};`
            console.log(deleteColumnQuery, "deletecolumnQuery");
            deleteColumnResult = await queryExecute(deleteColumnQuery);
            let deleteResult = await queryExecute(deleteOldDataQuery);
            fieldstableResult = await queryExecute(fieldstableQuery);

            changed = true;
        }

        if (columnQuery) {

            let alterColumnQuery = `ALTER TABLE "${newData.tablename}" ${columnQuery} ;`
            console.log(alterColumnQuery, "QUERY");
            let columnResult = await queryExecute(alterColumnQuery);

            if (constraint) {
                let constraintQuery = `ALTER TABLE "${newData.tablename}" ADD PRIMARY KEY (${constraint});`
                console.log(constraintQuery, "QURRYYYYYYYYYYYY")
                let constraintResult = await queryExecute(constraintQuery);
            }

            let deleteResult = await queryExecute(deleteOldDataQuery);
            fieldstableResult = await queryExecute(fieldstableQuery);

            changed = true;
        }

        if (deletecolumnArray.length != 0) {
            console.log(deletecolumnArray, "11111");

            deletecolumnArray.forEach((item) => {
                let query5 = squel
                    .delete()
                    .from("dropdowntable")
                    .where("colname= ?", item.colname)
                    .toString();
                console.log(query5, "QUERY 5")

                let response5 = queryExecute(query5);
            })

        }


        if (dropdownData.length > 0) {

            dropdownData.forEach((field) => {
                field.tableid = id;
            })
            let dropdownQuery = squel
                .insert()
                .into("dropdowntable")
                .setFieldsRows(dropdownData)
                .toString();

            let dropdowntableResult = await queryExecute(dropdownQuery);
        }

        return changed;

    } catch (err) {
        console.log(err, "1234");
        return Promise.reject(err);
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


module.exports = {
    CreateTable: CreateTable,
    viewTable: viewTable,
    deleteTable: deleteTable,
    modifyTable: modifyTable,
    TableData: TableData,
    editTable: editTable,
    checkTablename: checkTablename
}