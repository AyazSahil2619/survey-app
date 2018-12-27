const squel = require('squel');
const runQuery = require('../pgConnection');


async function queryExecute(obj) {

    try {
        let result = await runQuery.pool.query(obj)
        return result;
    } catch (err) {
        return Promise.reject(err)
    }
}


async function insert(body) {

    let obj = squel
        .insert()
        .into("credential")
        .set("username", body.name)
        .set("email", body.email)
        .set("password", body.password)
        .set("role", body.role)
        .toString();

    try {
        let response = await queryExecute(obj)
        return response;
    } catch (err) {
        console.log(err);
        return Promise.reject(err)
    }

}

async function login(username) {

    const query = squel
        .select()
        .from("credential")
        .where("username = ?", username)
        .toString();
    try {
        let response = await queryExecute(query)

        if (response.rowCount == 0) {
            return Promise.reject(null);
        }
        return response.rows[0];

    } catch (err) {

        return Promise.reject(err);
    }
}


async function check_login(req, res) {

    console.log(req.body, "BODY");

    const query = squel
        .select()
        .from("credential")
        .where("username = ?", req.body.username)
        .where("password = ?", req.body.password)
        .toString();
    try {
        let response = await queryExecute(query)

        console.log(response.rows[0], "RESPONSE");

        if (response.rowCount > 0) {
            return response.rows[0];
        } else {
            return null;
        }

    } catch (err) {

        return Promise.reject(err);
    }
}

module.exports = {
    insert: insert,
    login: login,
    check_login: check_login
}