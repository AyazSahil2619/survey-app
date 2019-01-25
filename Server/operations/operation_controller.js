const repository = require('./operation_repository')
const multer = require('multer');

// const DIR = '/home/sahil/Desktop/survey-app/Server/uploads';
const DIR = './uploads';


async function view(req, res) {
    const id = parseInt(req.params.id, 10);
    // console.log(id);

    try {
        var data = await repository.view(id)
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function addDataToTable(req, res) {
    const id = parseInt(req.params.id, 10);
    try {
        let data = await repository.addDataToTable(req, id);
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function TableData(req, res) {
    const id = parseInt(req.params.id, 10);

    try {
        var data = await repository.TableData(id)
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function deleteData(req, res) {
    const tableid = parseInt(req.params.tableid, 10);
    const rowid = parseInt(req.params.rowid, 10);


    try {
        var data = await repository.deleteData(tableid, rowid)
        res.status(200).json(data.rows)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function getdetails(req, res) {
    const tableid = parseInt(req.params.tableid, 10);
    const rowid = parseInt(req.params.uid, 10);

    try {
        var data = await repository.getdetails(tableid, rowid)
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function updateRow(req, res) {

    const tableid = parseInt(req.params.id, 10);

    try {
        let data = await repository.updateRow(req, tableid);
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function fetchDropdownList(req, res) {

    const tableid = parseInt(req.params.id, 10);
    console.log(tableid, "111");

    try {
        let data = await repository.fetchDropdownList(tableid);
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function tablename(req, res) {
    const id = parseInt(req.params.id, 10);
    console.log(id);

    try {
        var data = await repository.tablename(id)
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function fetchRadioList(req, res) {

    const tableid = parseInt(req.params.id, 10);
    console.log(tableid, "111");

    try {
        let data = await repository.fetchRadioList(tableid);
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}
async function fetchCheckboxList(req, res) {

    const tableid = parseInt(req.params.id, 10);

    try {
        let data = await repository.fetchCheckboxList(tableid);
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function checkToken(req, res) {

    const tableid = parseInt(req.params.tableid, 10);
    const token = req.params.token;

    try {
        let data = await repository.checkToken(tableid, token);
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(file, "!!!!!!!");
        cb(null, DIR)
    },
    filename: (req, file, cb) => {
        let extension = file.originalname.split('.').pop();
        cb(null, 'file_' + Date.now() + '.' + extension);
        // cb(null, file.originalname)
    }
});

var upload = multer({
    storage: storage
}).single("file");


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
    checkToken: checkToken,
    upload: upload,
}