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
        return data ;

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
 function compare(form_password, db_password){
     return (form_password == db_password);
 }


module.exports = {
    insert,
    login,
    comparePassword
}