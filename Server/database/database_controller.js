const repository = require('./database_repository');

async function CreateTable(req, res) {

    try {
        let data = await repository.CreateTable(req, res)
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function viewTable(req, res) {

    try {
        let data = await repository.viewTable(req, res)
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
        let data = await repository.modifyTable(req, res, id)
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

async function editTable(req, res) {
    const id = parseInt(req.params.id, 10);

    try {
        let data = await repository.editTable(req, res, id)
        res.status(200).json(data)

    } catch (err) {
        res.status(400).json(err);
    }
}

async function checkTablename(req, res) {
    const id = parseInt(req.params.id, 10);

    try {
        let data = await repository.checkTablename(req, res, id)
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
    editTable: editTable,
    checkTablename: checkTablename
}