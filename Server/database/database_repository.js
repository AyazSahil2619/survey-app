const squel = require('squel');
const runQuery = require('../pgConnection');
const nodemailer = require('nodemailer');


/**
 *  Database Query gets executed
 * @param {String} [query] the query to be executed 
 * @returns {Object[]}  The result get returned after Query execution
 */
async function queryExecute(query) {
    const pool = await runQuery.pool.connect();

    let result
    try {
        await pool.query('BEGIN');
        try {
            result = await pool.query(query);
        } catch (err) {
            console.log(err, "ERROR");
            await pool.query('ROLLBACK');
            return Promise.reject(err);
        }
    } finally {
        pool.release();
    }
    return result;
}


/**
 *  Transaction gets Committed or End  
 * @returns the result of running end query/transaction.
 */
async function _commitFunc() {

    let commitQuery = 'COMMIT'
    return await queryExecute(commitQuery);

}


/**
 * Creates a new Table into the database and inserting its details to Mastertable.
 * @param {Object} req It provides the  name and description of table
 * @returns {Object[]} The result of running create table query.
 */
async function CreateTable(req) {

    let query = '';
    let tablename = escape(req.body.tablename);
    let description = escape(req.body.description);
    let user = req.body.currentUser;
    let fieldsData = [];

    query = `CREATE TABLE IF NOT EXISTS "${tablename}" (uid serial);`

    let query1 = squel
        .insert()
        .into("mastertable")
        .set("tablename", tablename)
        .set("\"Description\"", description)
        .set("createdby", user)
        .toString();

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
        let table_id = response2.rows[0].id;

        fieldsData.push({
            fieldname: 'uid',
            label: false,
            fieldtype: 'serial',
            Konstraint: false,
            u_konstraint: false,
            required: false,
            text_length: 0,
            tableid: table_id
        })

        let fieldstableQuery = squel
            .insert()
            .into("fieldstable")
            .setFieldsRows(fieldsData)
            .toString();

        let fieldstableResult = await queryExecute(fieldstableQuery);
        await _commitFunc();

        return response2.rows[0];

    } catch (err) {
        return Promise.reject(err.code)
    }

}


/**
 * Add new Field/column to specific table .
 * @param {Object} req It provides details of fields (i.e. fieldname,fieldtype,constraints, 
 * arrayList which contains radio, checkbox,dropdown values)
 * @param {Number} id This id is the table Id to which field is added
 * @returns {Object[]} The result of running insert data query.
 */
async function addColumn(req, id) {

    let body = [req.body];
    let fieldsData = [];
    let colquery = '';
    let constraints = '';
    let list = [];
    let fieldtype = req.body.type;
    let text_length;
    if ((req.body.type == 'short_text' || req.body.type == 'long_text') && (req.body.text_length > 0 && req.body.text_length < 2000)) {
        text_length = req.body.text_length;
    } else if (req.body.type != 'short_text' && req.body.type != 'long_text') {
        text_length = 0;
    } else {
        text_length = 100;
    }

    let unique_key_constraint = req.body.unique_key;
    let optionData = [];

    if ((fieldtype == 'dropdown' || fieldtype == 'radio' || fieldtype == 'checkbox') && (req.body.arrayList && req.body.arrayList.length > 0)) {
        list = req.body.arrayList
    } else {
        list = [];
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
        tableid: id,
        u_konstraint: req.body.unique_key,
        required: req.body.required_key,
        text_length: text_length
    })

    fieldsData.forEach((item) => {
        if (item.Konstraint == 'true') {
            constraints = constraints + ' ' + item.fieldname + ',';
        }

        if (item.fieldtype == 'dropdown' || item.fieldtype == 'radio') {
            colquery = colquery + 'ADD COLUMN' + ' ' + '"' + item.fieldname + '"' + ' ' + 'text' + ',';
        } else if (item.fieldtype == 'checkbox') {
            colquery = colquery + 'ADD COLUMN' + ' ' + '"' + item.fieldname + '"' + ' ' + 'text[]' + ',';
        } else if (item.fieldtype == 'email') {
            colquery = colquery + 'ADD COLUMN' + ' ' + '"' + item.fieldname + '"' + ' ' + 'varchar' + ',';
        } else if (item.fieldtype == 'short_text' || item.fieldtype == 'long_text') {
            colquery = colquery + 'ADD COLUMN' + ' ' + '"' + item.fieldname + '"' + ' ' + `varchar(${text_length})` + ',';
        } else if (item.fieldtype == 'date') {
            colquery = colquery + 'ADD COLUMN' + ' ' + '"' + item.fieldname + '"' + ' ' + `timestamp with time zone` + ',';
        } else {
            colquery = colquery + 'ADD COLUMN' + ' ' + '"' + item.fieldname + '"' + ' ' + item.fieldtype + ',';
        }
    })

    constraints = constraints.replace(/(^[,\s]+)|([,\s]+$)/g, '');
    colquery = colquery.replace(/(^[,\s]+)|([,\s]+$)/g, '');

    if (fieldsData.length != 0) {
        fieldstableQuery = squel
            .insert()
            .into("fieldstable")
            .setFieldsRows(fieldsData)
            .toString();
    }

    console.log(fieldstableQuery, "QUERRY");

    try {
        let response = await queryExecute(query);
        let fieldsDataResult;
        let tablename = response.rows[0].tablename;

        if (fieldsData.length != 0) {
            let query1 = `ALTER TABLE "${tablename}" ${colquery} ;`
            let addColumnResult = await queryExecute(query1);
            fieldsDataResult = await queryExecute(fieldstableQuery);
        }

        if (constraints) {
            let constraintQuery = `ALTER TABLE "${tablename}" ADD PRIMARY KEY ("${constraints}");`
            let constraintResult = await queryExecute(constraintQuery);
        }

        if (unique_key_constraint == 'true') {
            let constraintQuery = `ALTER TABLE "${tablename}" ADD UNIQUE ("${escape(req.body.colname)}");`
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

        await _commitFunc();

        return fieldsDataResult;

    } catch (err) {
        return Promise.reject(err);
    }
}




/**
 * Get the list of table .
 * @returns {newArray:[Object]} The list of record from mastertable.
 */
async function viewTable() {

    let query = squel
        .select()
        .from("mastertable")
        .toString();

    try {
        let resp = await queryExecute(query);
        await _commitFunc();

        let newArray = [];

        if (resp.rowCount > 0) {
            resp.rows.forEach((item) => {
                let datas = {};

                for (var key in item) {
                    if (key == 'tablename' || key == 'Description') {
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

/**
 * Delete the table from database and its subsequent data from related table.
 * @param {number} [id] This id is the table id for specified table.
 * @returns {Object[]} The result of running delete data query.
 */
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
        await _commitFunc();


        if (resp1.rowCount > 0) {
            return;
        } else {
            return Promise.reject({
                err: "Table not found"
            });
        }

    } catch (err) {
        return Promise.reject(err);
    }

}

/**
 * Update the column (i.e modified by AND modified at)
 * @param {String} [req] Its body provide the current user and time at which
 *  the changes has been made to database
 * @param {number} [id] this is the table is to which the changes has been made.
 * @returns {Object[]} The result of running update data query
 */
async function modifyTable(req, id) {

    let query = squel
        .update()
        .table('mastertable')
        .set('modifiedby', req.body.user)
        .set('modifiedat', req.body.time)
        .where('id=?', id)
        .toString();

    try {
        let resp = await queryExecute(query);
        await _commitFunc();

        return resp;
    } catch (err) {
        return Promise.reject(err);
    }
}


/**
 * Gets the details of specific table (i.e tablename , description) 
 * @param {number} [id] The specified table id which details is to be fetched
 * @returns {newArray : Object[]} It return the data of specific table 
 */
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
                if (key == 'tablename' || key == 'Description') {
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

/**
 * Check the table name from existing list of records
 * @param {Object} [req] Its body provide the specified table name which is to be checked
 * @param {nummber} [id] This is the current table id 
 * @returns {check:{boolean}} if true then the current table name can be used to create a new table
 */
async function checkTablename(req, id) {

    console.log(req.body, "BODY");
    console.log(id, "Id")

    if (id == 0) {
        let query = squel
            .select()
            .from("mastertable")
            .field("tablename")
            .toString();
        let check = true;

        try {
            let response = await queryExecute(query);
            await _commitFunc();


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
    } else {
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


}


/**
 * Update/Edit/Rename the table data (i.e table name AND description)
 * @param {Object} [req] Its body provide the table name and description
 * @param {number} [id] the TAble id of current table which is to be modified
 * @returns {object[]} the result of running update data query.
 */
async function editTableInfo(req, id) {

    let newData = req.body;

    let updateMastertableQuery = squel
        .update()
        .table('mastertable')
        .set('tablename', escape(newData.tablename))
        .set('"Description"', escape(newData.description))
        .where('id=?', id)
        .toString();

    try {

        let response = await TableData(id);
        let oldTablename = escape(response[0].tablename);
        console.log(oldTablename != escape(newData.tablename), "LLLL");
        if (oldTablename != escape(newData.tablename)) {
            let query = `ALTER TABLE "${oldTablename}"  RENAME TO "${escape(newData.tablename)}";`
            let tableResult = await queryExecute(query);
        }

        let mastertableResult = await queryExecute(updateMastertableQuery);
        await _commitFunc();

        return mastertableResult;

    } catch (err) {
        console.log(err, "Error")
        return Promise.reject(err)
    }

}

/**
 * Gets the details of fields (i.e. fieldname , fieldtype, constraint, 
 * values of dropdown,radio or checkbox if it exist)
 * @param {Number} tableid the id of specified table
 * @param {Number} fieldid the id of specified field of the specific table
 * @returns {newArray : object[]} It contains the details of specified field
 */
async function fetchFieldData(tableid, fieldid) {

    console.log(tableid, fieldid, "OOO");

    let query = `SELECT d.databasevalue AS d_dbvalue, d.displayvalue AS d_dspvalue,
     c.databasevalue AS c_dbvalue,c.displayvalue AS c_dspvalue,
     r.databasevalue AS r_dbvalue,r.displayvalue AS r_dspvalue,
     f.fieldname,f.fieldtype,f.label,f.tableid,f.konstraint,f.f_uid,f.u_konstraint,f.required,f.text_length
     FROM public.fieldstable AS f 
	 FULL JOIN dropdowntable AS d ON d.tableid = f.tableid AND d.colname = f.fieldname 
     FULL JOIN radiotable AS r ON r.tableid = f.tableid AND r.colname = f.fieldname 
     FULL JOIN checkboxtable AS c ON c.tableid = f.tableid AND c.colname = f.fieldname where f.f_uid =${fieldid} ;`

    try {
        let response = await queryExecute(query);
        let newArray = [];

        response.rows.forEach((item) => {
            let datas = {};

            for (var key in item) {
                if (item[key] != null) {
                    datas[key] = unescape(item[key]);
                }
            }
            newArray.push(datas);

        })

        await _commitFunc();

        return newArray;

    } catch (err) {
        return Promise.reject(err)
    }

}

/**
 * Update/Edit the specified field of a table
 * @param {Object} req Its body provides the table data (i.e fieldname, fieldtype, constraint,
 *  ArrayList : value of checkbox, radio, dropdown)
 * @param {Number} table_id the id of specified table
 * @param {Number} field_id the id of specified field
 * @returns {Object []} the result of running update data query.
 */
async function fieldEdit(req, table_id, field_id) {

    console.log(req.body, "REACHING FIELD EDIT");

    let colquery = '';
    let fieldtype = req.body.type;
    let unique_key_constraint = req.body.unique_key;
    let required_key = req.body.required_key;
    let optionList = [];
    let optionData = [];
    let text_length;

    // if ((fieldtype == 'short_text' || fieldtype == 'long_text') && (req.body.text_length && req.body.text_length > 0)) {
    //     text_length = req.body.text_length;
    //     console.log("IF");
    // } else if (fieldtype != 'short_text' || fieldtype != 'long_text') {
    //     text_length = 0;
    //     console.log("ELSE IF");

    // } else {
    //     console.log("ELSE");
    //     text_length = 100;
    // }

    if (fieldtype == 'short_text' || fieldtype == 'long_text') {
        if (req.body.text_length && req.body.text_length > 0) {
            text_length = req.body.text_length;
        } else {
            text_length = 100;
        }
    } else {
        text_length = 0;
    }


    if ((fieldtype == 'dropdown' || fieldtype == 'radio' || fieldtype == 'checkbox') && (req.body.List && req.body.List.length > 0)) {
        optionList = req.body.List;
    } else {
        optionList = [];
    }
    let new_fieldname = escape(req.body.colname);
    let new_fieldtype;

    if (fieldtype == 'dropdown' || fieldtype == 'radio') {
        new_fieldtype = 'text';
    } else if (fieldtype == 'checkbox') {
        new_fieldtype = 'text[]';
    } else if (fieldtype == 'email') {
        new_fieldtype = 'varchar';
    } else if (fieldtype == 'short_text' || fieldtype == 'long_text') {
        new_fieldtype = `varchar(${text_length})`;
    } else {
        new_fieldtype = fieldtype;
    }

    let new_label = escape(req.body.label);
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
        .set("fieldtype", fieldtype)
        .set("label", new_label)
        .set("konstraint", new_konstraint)
        .set("u_konstraint", unique_key_constraint)
        .set("required", required_key)
        .set("text_length", text_length)
        .where("f_uid = ?", field_id)
        .toString()



    try {
        let response = await queryExecute(query);
        let response1 = await queryExecute(query1);
        let tablename = response.rows[0].tablename;
        let prv_fieldname = response1.rows[0].fieldname;
        let prv_fieldtype = response1.rows[0].fieldtype;
        let prv_konstraint = response1.rows[0].konstraint;
        let prv_u_konstraint = response1.rows[0].u_konstraint;

        console.log(prv_fieldtype != new_fieldtype, "ssss")
        if (prv_fieldtype != new_fieldtype) {
            let query2 = ` ALTER TABLE "${tablename}" ALTER COLUMN "${prv_fieldname}"
                             SET DATA TYPE ${new_fieldtype} USING ("${prv_fieldname}" :: ${new_fieldtype});`
            let response2 = await queryExecute(query2);
        }
        if (prv_fieldname != new_fieldname) {
            let query3 = `ALTER TABLE "${tablename}"  RENAME COLUMN "${prv_fieldname}" TO "${new_fieldname}"`
            let response3 = await queryExecute(query3);
        }

        if (new_konstraint == 'true') {
            let query = `ALTER TABLE "${tablename}" ADD PRIMARY KEY ("${new_fieldname}")`
            let response = await queryExecute(query);
        } else if (new_konstraint == 'false' && prv_konstraint == true) {
            let query = `ALTER TABLE "${tablename}" DROP CONSTRAINT "${tablename}_pkey"`
            let response = await queryExecute(query);
        } else if (unique_key_constraint == 'true') {
            let query = `ALTER TABLE "${tablename}" ADD UNIQUE ("${new_fieldname}")`
            let response = await queryExecute(query);
        } else if (unique_key_constraint == 'false' && prv_u_konstraint == true) {
            let query = `ALTER TABLE "${tablename}" DROP CONSTRAINT "${tablename}_${new_fieldname}_key"`
            let response = await queryExecute(query);
        }

        if (prv_fieldtype == 'dropdown' || prv_fieldtype == 'radio' || prv_fieldtype == 'checkbox') {

            let query6 = squel
                .delete()
                .from(`${prv_fieldtype}table`)
                .where("tableid = ?", table_id)
                .where("colname = ?", prv_fieldname)
                .toString()

            let response6 = await queryExecute(query6);

        }

        if (optionData.length > 0) {
            console.log("INSIDE OPTION DATA ")
            let query7 = squel
                .insert()
                .into(`${fieldtype}table`)
                .setFieldsRows(optionData)
                .toString();

            let response7 = await queryExecute(query7);
            console.log("INSIDE OPTION DATA 22222")

        }


        let response4 = await queryExecute(query4);

        await _commitFunc();

        return response4;

    } catch (err) {
        console.log("ERROR ===", err);
        return Promise.reject(err)
    }

}

/**
 * Delete the specified field from a table
 * @param {Number} tableid the Id of table to which execution will be made.
 * @param {Number} fieldid The Id of field which is to be deleted.
 * @returns {Object[]} the result of running delete data query.
 */
async function fieldDelete(tableid, fieldid) {

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

        let query3 = `ALTER TABLE "${tablename}" DROP COLUMN IF EXISTS "${fieldname}" ; `
        let response3 = await queryExecute(query3);

        let commitQuery = 'COMMIT'
        let commitResponse = await queryExecute(commitQuery);

        await _commitFunc();

        return response3;

    } catch (err) {
        return Promise.reject(err)
    }

}


/**
 * Insert the token generated into the table
 * @param {Object} req Its body provides the following data (i.e current user, tableid )
 * @returns {Token:{String}} It returns the token generated randomly for specified table
 */
async function generateUrl(req) {

    let token = Math.random().toString(36).substr(2);
    let user = req.body.user;
    let tableid = req.body.tableid;

    let query = squel
        .insert()
        .into('urltable')
        .set("tableid", tableid)
        .set("username", user)
        .set("token", token)
        .toString();

    let query1 = squel
        .select()
        .from('credential')
        .where("username= ?", user)
        .toString();

    try {

        let result = await queryExecute(query);
        let result1 = await queryExecute(query1);

        await _commitFunc();

        return token;

    } catch (err) {
        return Promise.reject(err);
    }

}

/**
 * Sending mail to the specified user
 * @param {Object} req Its body provides sender mail id, the url 
 * @returns
 */
function sendMail(req) {

    // let senderEmail = req.body.sendermailid;
    let email = req.body.mailid;
    let link = req.body.url;

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            "type": "OAuth2",
            "user": "sayaz@argusoft.in",
            "clientId": "659347403046-4esj9f3orn7nbsprkqp4vo20d28366k2.apps.googleusercontent.com",
            "clientSecret": "KKHnbrnZNDQkbZSMmjuLLzXF",
            "refreshToken": "1/f370CyTdiVTzQI4r1mOi5yWf8_lISNiL6YBHVPvFCyw",
            "accessToken": "ya29.Glt8BsLYtZ-HTyAjVgfqFT-N2A1A0ptrW0vItodl8btwSXU0Rtl4KZzfXPBZm3CH3ShBqVPXTVrrhHvDhT2NBtIFAlsqi0abDUKGeEoISWoNDjb9kZAGKvqFvJoJ"
        }
    });

    let mailOptions = {
        from: 'sayaz@argusoft.in',
        to: email,
        subject: 'Survey Link',
        text: `Click on the given Link to fill up the Survey Form ${link}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            callback(err);
        } else {
            callback(null, info);
        }
    })

}







module.exports = {

    CreateTable: CreateTable,
    viewTable: viewTable,
    deleteTable: deleteTable,
    modifyTable: modifyTable,
    TableData: TableData,
    checkTablename: checkTablename,
    addColumn: addColumn,
    editTableInfo: editTableInfo,
    fetchFieldData: fetchFieldData,
    fieldEdit: fieldEdit,
    fieldDelete: fieldDelete,
    generateUrl: generateUrl,
    sendMail: sendMail

}


























// async function check(req, res, id) {


//     let query = squel
//         .select()
//         .from("mastertable")
//         .field("id")
//         .field("tablename")
//         .toString();
//     let check = true;

//     try {
//         let response = await queryExecute(query);

//         response.rows.forEach((item, index) => {
//             if (item.id != id) {
//                 if (item.tablename === req.body.tablename) {
//                     check = false;
//                     return check;
//                 }
//             }
//         });
//         return check;

//     } catch (err) {
//         console.log(err);
//         return Promise.reject(err)
//     }

// }



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