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

function cargarFacturas(req, res, msj) {
    const client = new Client(connectionData)
    client.connect()
    client.query('SELECT MAX(_id) FROM Facturas')
        .then(response => {
            let numerofactura = 1
            let numerofacturaText = "1"
            if (response.rows.length > 0) {
                numerofactura = response.rows[0].max + 1
                numerofacturaText = numerofactura
                while (numerofactura < 100000000) {
                    numerofactura = numerofactura*10
                    numerofacturaText = "0" + numerofacturaText
                }
            }
            console.log(response)
            client.query('SELECT * FROM Productos')
                .then(resp => {
                    client.end()
                    res.status(200).send({
                        numerofactura: numerofacturaText,
                        productos: resp.rows,
                        message: msj
                    })
                })
                .catch(err => {
                    console.log(err)
                    client.end()
                })
        })
        .catch(err => {
            console.log(err)
            client.end()
        })
}

function guardarFactura(req, res) {
    let fechafactura = req.body.fechafactura
    let idcliente = req.body.idcliente
    let descuento = req.body.descuento
    let idvendedor = req.body.idvendedor
    const client = new Client(connectionData)
    client.connect()
    client.query('INSERT INTO Facturas (fechafactura, idcliente, descuento, idvendedor) VALUES ($1, $2, $3, $4) RETURNING _id', [fechafactura, idcliente, descuento, idvendedor])
        .then(resp => {
            client.end()
            res.status(200).send({
                message: "Factura agregada con éxito",
                idFactura: resp.rows[0]
            })
        })
        .catch(err => {
            client.end()
            console.log(err)
            res.status(500).send({
                message: err
            })
        })
}

function buscarFactura(req, res) {
    const client = new Client(connectionData)
    client.connect()
    client.query('SELECT * FROM Facturas WHERE _id=($1)', [req.body._id])
        .then(response => {
            client.end()
            if (response.rows.length > 0) {
                res.status(200).send({
                    Factura: response.rows[0],
                    codigo: 0
                })
            } else {
                res.status(200).send({
                    codigo: 1
                })
            }
        })
        .catch(err => {
            console.log(err)
            client.end()
        })
}

module.exports = {
    cargarFacturas,
    guardarFactura,
    buscarFactura
}
