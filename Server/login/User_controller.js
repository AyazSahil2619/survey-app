const bodyParser = require('body-parser');
const User_service = require('./User_service');

// For inserting the credentials in the database
async function insert(req, res) {

    try {
        let data = await User_service.insert(req.body, res)
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

// For retrieving data of a logger
async function login(username) {

    try {
        let data = await User_service.login(username);
        return data;

    } catch (err) {
        return err;
    }
}

// Matching the password
async function comparePassword(form_password, db_password) {
    try {
        let isMatch = await compare(form_password, db_password)
        return isMatch;

    } catch (err) {
        return false;
    }

}

function compare(form_password, db_password) {
    return (form_password == db_password);
}



async function check_login(req, res) {

    try {
        let data = await User_service.check_login(req, res);

        console.log(data, "DATA");

        if (data != null) {

            req.session.user = data.username;
            req.session.save();

            res.status(200).json(data);
        } else {
            res.status(200).json({
                msg: "INVALID"
            });
        }
        // return data;

    } catch (err) {
        console.log(err, "ERROR IN LOGIN");
        return err;
    }
}


module.exports = {
    insert,
    login,
    comparePassword,
    check_login
}