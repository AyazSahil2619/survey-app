const User_repository = require('./User_repository.js');


async function insert(body, res) {

    try {

        let data = await User_repository.insert(body)
        return data;
        // res.status(200).json(data)

    } catch (err) {
        return Promise.reject(err);
    }

}

async function login(username) {

    try {
        let data = await User_repository.login(username);
        return data;

    } catch (err) {
        return Promise.reject(err);
    }
}



module.exports = {
    insert: insert,
    login: login,

}