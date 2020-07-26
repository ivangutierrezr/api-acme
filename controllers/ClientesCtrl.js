'use strict'

const { Client } = require('pg')

const connectionData = {
    user: 'antilopeinteractive',
    server: 'AntilopeInteractive',
    host: 'localhost',
    database: 'Acme',
    password: 'antilope',
    port: 5432,
}

function cargarClientes(req, res, msj) {
    const client = new Client(connectionData)
    client.connect()
    client.query('SELECT * FROM Clientes')
        .then(response => {
            client.end()
            res.status(200).send({
                clientes: response.rows,
                message: msj
            })
        })
        .catch(err => {
            console.log(err)
            client.end()
            res.status(500).send({
                message: err
            })
        })
}

function guardarCliente(req, res) {
    let nombre = req.body.nombre
    let tipodocumento = req.body.tipodocumento
    let numeroidentificacion = req.body.numeroidentificacion
    let fechanacimiento = req.body.fechanacimiento
    let telefono = req.body.telefono
    let direccion = req.body.direccion
    let mayorista = req.body.mayorista
    const client = new Client(connectionData)
    client.connect()
    client.query('INSERT INTO Clientes (nombre, tipodocumento, numeroidentificacion, fechanacimiento, telefono, direccion, mayorista) VALUES ($1, $2, $3, $4, $5, $6, $7)', [nombre, tipodocumento, numeroidentificacion, fechanacimiento, telefono, direccion, mayorista])
        .then(resp => {
            client.end()
            cargarClientes(req, res, "Cliente agregado con éxito")
        })
        .catch(err => {
            client.end()
            console.log(err)
            res.status(500).send({
                message: err
            })
        })
}

function editarCliente(req, res) {
    let _id = req.body._id
    let nombre = req.body.nombre
    let tipodocumento = req.body.tipodocumento
    let numeroidentificacion = req.body.numeroidentificacion
    let fechanacimiento = req.body.fechanacimiento
    let telefono = req.body.telefono
    let direccion = req.body.direccion
    let mayorista = req.body.mayorista
    const client = new Client(connectionData)
    client.connect()
    client.query('UPDATE Clientes SET nombre=($1), tipodocumento=($2), numeroidentificacion=($3), fechanacimiento=($4), telefono=($5), direccion=($6), mayorista=($7) WHERE _id=($8)', [nombre, tipodocumento, numeroidentificacion, fechanacimiento, telefono, direccion, mayorista, _id])
        .then(resp => {
            client.end()
            cargarClientes(req, res, "Cliente actualizado con éxito")
        })
        .catch(err => {
            client.end()
            console.log(err)
            res.status(500).send({
                message: err
            })
        })
}

function eliminarCliente(req, res) {
    let clienteid = req.body.clienteid
    const client = new Client(connectionData)
    client.connect()
    client.query('DELETE FROM Clientes WHERE clienteid=($1)', [clienteid])
        .then(resp => {
            client.end()
            cargarClientes(req, res, "Cliente eliminado de la base de datos con éxito")
        })
        .catch(err => {
            console.log(err)
            client.end()
        })
}

function buscarCliente(req, res) {
    const client = new Client(connectionData)
    client.connect()
    client.query('SELECT * FROM Clientes WHERE _id=($1)', [req.body._id])
        .then(response => {
            client.end()
            if (response.rows.length > 0) {
                res.status(200).send({
                    cliente: response.rows[0],
                    codigo: 0
                })
            } else {
                res.status(200).send({
                    codigo: 1
                })
            }
        })
        .catch(err => {
            console.log(err);
            client.end()
        })
}
function buscarClientePorCedula(req, res) {
    const client = new Client(connectionData)
    client.connect()
    client.query('SELECT * FROM Clientes WHERE numeroidentificacion=($1)', [req.body.numeroidentificacion])
        .then(response => {
            client.end()
            if (response.rows.length > 0) {
                res.status(200).send({
                    cliente: response.rows[0],
                    codigo: 1
                })
            } else {
                res.status(200).send({
                    codigo: 0
                })
            }
        })
        .catch(err => {
            console.log(err);
            client.end()
        })
}

module.exports = {
    cargarClientes,
    guardarCliente,
    editarCliente,
    eliminarCliente,
    buscarCliente,
    buscarClientePorCedula
}
