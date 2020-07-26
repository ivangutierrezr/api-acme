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

/* SELECT c.customerName, e.firstName, e.lastName, e.extension
FROM customers c INNER JOIN employees e ON c.salesRepEmployeeNumber = e.employeeNumber
ORDER BY c.customerName */

function cargarCompras(req, res, msj) {
    const client = new Client(connectionData)
    client.connect()
    client.query('SELECT cp._id, cp.fechacompra, cp.cantidadcompra, cp.preciocompra, cp.idproducto, p.nombre FROM ComprasProductos cp INNER JOIN Productos p ON p._id = cp.idproducto ORDER BY cp.fechacompra')
        .then(response => {
            client.end()
            res.status(200).send({
                compras: response.rows,
                message: msj
            })
        })
        .catch(err => {
            console.log(err);
            client.end()
        })
}

function guardarCompra(req, res) {
    let fechacompra = req.body.fechacompra
    let cantidadcompra = req.body.cantidadcompra
    let preciocompra = req.body.preciocompra
    let idproducto = req.body.idproducto
    const client = new Client(connectionData)
    client.connect()
    client.query('INSERT INTO ComprasProductos (fechacompra, cantidadcompra, preciocompra, idproducto) VALUES ($1, $2, $3, $4)', [fechacompra, cantidadcompra, preciocompra, idproducto])
        .then(resp => {
            client.end()
            res.status(200).send({
                message: "Compra agregada con éxito"
            })
        })
        .catch(err => {
            client.end()
            console.log(err);
            res.status(500).send({
                message: err
            })
        })
}

function buscarCompra(req, res) {
    const client = new Client(connectionData)
    client.connect()
    client.query('SELECT * FROM ComprasProductos WHERE _id=($1)', [req.body._id])
        .then(response => {
            client.end()
            if (response.rows.length > 0) {
                res.status(200).send({
                    Compra: response.rows[0],
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

function eliminarCompra(req, res) {
    let _id = req.body._id
    const client = new Client(connectionData)
    let ultimopreciocompra = 0
    client.connect()
    client.query('DELETE FROM ComprasProductos WHERE _id=($1)', [_id])
        .then(resp => {
            client.query('SELECT MAX(_id) FROM ComprasProductos WHERE idproducto=($1)', [req.body.idproducto])
                .then(response => {
                    if (response.rows.length > 0) {
                        let maxId = response.rows[0].max
                        client.query('SELECT preciocompra FROM ComprasProductos WHERE _id=($1)', [maxId])
                            .then(result => {
                                ultimopreciocompra = result.rows[0].preciocompra
                                actualizarProducto()
                            })
                            .catch(err => {
                                console.log(err);
                                client.end()
                            })
                    } else {
                        actualizarProducto()
                    }
                })
                .catch(err => {
                    console.log(err);
                    client.end()
                })
        })
        .catch(err => {
            console.log(err)
            client.end()
        })

    function actualizarProducto() {
        client.query('SELECT * FROM Productos WHERE _id=($1)', [req.body.idproducto])
            .then(response => {
                let producto = response.rows[0]
                let cantidadGuardada = parseInt(producto.cantidad)
                let cantidadComprada = parseInt(req.body.cantidadcompra)
                let nuevaCantidad = cantidadGuardada - cantidadComprada
                client.query('UPDATE Productos SET cantidad=($1), preciocompra=($2) WHERE _id=($3)', [nuevaCantidad, ultimopreciocompra, producto._id])
                    .then(resp2 => {
                        client.end()
                        cargarCompras(req, res, "Compra eliminada de la base de datos con éxito")
                    })
                    .catch(err => {
                        client.end()
                        console.log(err)
                        res.status(500).send({
                            message: err
                        })
                    })
            })
            .catch(err => {
                console.log(err)
                client.end()
            })
    } 
}

module.exports = {
    cargarCompras,
    guardarCompra,
    buscarCompra,
    eliminarCompra
}
