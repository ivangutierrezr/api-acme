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

function cargarVentas(req, res, msj) {
    let contador = 0
    let ventas
    let facturas
    const client = new Client(connectionData)
    client.connect()
    client.query('SELECT v._id, v.idfactura, v.idproducto, v.precioventa, v.cantidadproducto, f.fechafactura, f.descuento, p.nombre FROM Ventas v INNER JOIN Facturas f ON f._id = v.idfactura INNER JOIN Productos p ON p._id = v.idproducto')
        .then(resp => {
            console.log(resp.rows)
            client.end()
            res.status(200).send({
                ventas: resp.rows
            })
        })
        .catch(err => {
            console.log(err);
            client.end()
        })
}

function guardarVenta(req, res) {
    let contador = 0
    const client = new Client(connectionData)
    client.connect()
    function guardarCadaVenta() {
        let producto = req.body[contador]
        let cantidadproducto = producto.cantidadproducto
        let precioventa = producto.precioventa
        let idproducto = producto.idproducto
        let idfactura = producto.idfactura
        client.query('INSERT INTO Ventas (cantidadproducto, precioventa, idproducto, idfactura) VALUES ($1, $2, $3, $4)', [cantidadproducto, precioventa, idproducto, idfactura])
            .then(resp => {
                contador++
                if (contador < req.body.length) {
                    setTimeout(() => {
                        guardarCadaVenta()
                    }, 10);
                } else {
                    client.end()
                    res.status(200).send({
                        message: "Venta agregada con éxito"
                    })
                }
            })
            .catch(err => {
                client.end()
                console.log(err);
                res.status(500).send({
                    message: err
                })
            })
    }
    guardarCadaVenta()
}

function buscarVenta(req, res) {
    const client = new Client(connectionData)
    client.connect()
    client.query('SELECT * FROM Ventas WHERE _id=($1)', [req.body._id])
        .then(response => {
            client.end()
            if (response.rows.length > 0) {
                res.status(200).send({
                    Venta: response.rows[0],
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

module.exports = {
    cargarVentas,
    guardarVenta,
    buscarVenta
}
