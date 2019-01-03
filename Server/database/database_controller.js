const repository = require('./database_repository');

async function CreateTable(req, res) {

    try {
        let data = await repository.CreateTable(req);
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function viewTable(req, res) {

    try {
        let data = await repository.viewTable()
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function deleteTable(req, res) {
    const id = parseInt(req.params.id, 10);
    try {
        let data = await repository.deleteTable(id);
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function modifyTable(req, res) {
    const id = parseInt(req.params.id, 10);

    try {
        let data = await repository.modifyTable(req, id)
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function TableData(req, res) {
    const id = parseInt(req.params.id, 10);

    try {
        let data = await repository.TableData(id)
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function checkTablename(req, res) {
    const id = parseInt(req.params.id, 10);
    console.log(id, "IIIIIIIDDDDDDDDDDDDDDD")

    try {
        let data = await repository.checkTablename(req, id)
        res.status(200).json(data)

    } catch (err) {
        console.log(err, "ERROR");
        res.status(400).json(err);
    }
}

async function addColumn(req, res) {
    const id = parseInt(req.params.id, 10);

    try {
        let data = await repository.addColumn(req, id)

        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function editTableInfo(req, res) {
    const id = parseInt(req.params.id, 10);

    try {
        let data = await repository.editTableInfo(req, id)
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function fetchFieldData(req, res) {
    const tableid = parseInt(req.params.tableid, 10);
    const fieldid = parseInt(req.params.fieldid, 10)

    try {
        let data = await repository.fetchFieldData(tableid, fieldid)
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function fieldEdit(req, res) {
    const table_id = parseInt(req.params.tableid, 10);
    const field_id = parseInt(req.params.fieldid, 10);

    try {
        let data = await repository.fieldEdit(req, table_id, field_id)
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}


async function fieldDelete(req, res) {
    const table_id = parseInt(req.params.tableid, 10);
    const field_id = parseInt(req.params.fieldid, 10);

    try {
        let data = await repository.fieldDelete(table_id, field_id)
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}


async function generateUrl(req, res) {

    try {
        let data = await repository.generateUrl(req)
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}


async function sendMail(req, res) {

    try {
        let data = await repository.sendMail(req)
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
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