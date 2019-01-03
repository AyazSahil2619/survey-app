const squel = require('squel');
const runQuery = require('../pgConnection');


/**
 * Database query execution
 * @param {String} obj the query to be executed.
 * @returns {Object[]} the result of the running query
 */
async function queryExecute(obj) {

    try {
        let result = await runQuery.pool.query(obj)
        return result;
    } catch (err) {
        return Promise.reject(err)
    }
}

/**
 * Insert the data to the credential table
 * @param {Object} [body] It provides the basic details of user to be inserted.
 * @returns {Object[]} the result of running insert data query.
 */
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
        return Promise.reject(err)
    }

}

/**
 * Get the details of User
 * @param {String} username The name of the user to login.
 * @returns {object} The details of the user if it exist.
 */
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

/**
 * Checking the user with its credentials.
 * @param {Object} [req] It provides the username and password.
 * @returns {String} if user exist its credentials get returned else null.
 */
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