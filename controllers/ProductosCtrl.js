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

function cargarProductos(req, res, msj) {
    const client = new Client(connectionData)
    client.connect()
    client.query('SELECT * FROM Productos')
        .then(response => {
            client.end()
            res.status(200).send({
                productos: response.rows,
                message: msj
            })
        })
        .catch(err => {
            console.log(err)
            client.end()
        })
}

function guardarProducto(req, res) {
    let nombre = req.body.nombre
    let descripcion = req.body.descripcion
    let cantidad = 0
    let preciocompra = 0
    let precioventa = 0
    const client = new Client(connectionData)
    client.connect()
    client.query('INSERT INTO productos (nombre, descripcion, cantidad, preciocompra, precioventa) VALUES ($1, $2, $3, $4, $5)', [nombre, descripcion, cantidad, preciocompra, precioventa])
        .then(resp => {
            client.end()
            cargarProductos(req, res, "Producto agregado con éxito")
        })
        .catch(err => {
            client.end()
            console.log(err)
            res.status(500).send({
                message: err
            })
        })
}

function editarProducto(req, res) {
    let _id = req.body._id
    let nombre = req.body.nombre
    let descripcion = req.body.descripcion
    let precioventa = req.body.precioventa
    const client = new Client(connectionData)
    client.connect()
    client.query('UPDATE Productos SET nombre=($1), descripcion=($2), precioventa=($3) WHERE _id=($4)', [nombre, descripcion, precioventa, _id])
        .then(resp => {
            client.end()
            cargarProductos(req, res, "Producto actualizado con éxito")
        })
        .catch(err => {
            client.end()
            console.log(err)
            res.status(500).send({
                message: err
            })
        })
}

function editarProductoCantidades(req, res) {
    let _id = req.body._id
    let cantidadComprada = parseInt(req.body.cantidadComprada)
    let preciocompra = req.body.preciocompra
    const client = new Client(connectionData)
    client.connect()
    client.query('SELECT * FROM Productos WHERE _id=($1)', [_id])
        .then(response => {
            let producto = response.rows[0]
            let cantidad = parseInt(producto.cantidad)
            let totalCantidad = cantidadComprada + cantidad
            client.query('UPDATE Productos SET cantidad=($1), preciocompra=($2) WHERE _id=($3)', [totalCantidad, preciocompra, _id])
                .then(resp => {
                    client.end()
                    cargarProductos(req, res, "Producto actualizado con éxito")
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
            console.log(err);
            client.end()
        })
}

function actualizarProductos(req, res) {
    let contador = 0
    const client = new Client(connectionData)
    client.connect()
    function actualizarCadaProducto() {
        let producto = req.body[contador]
        let _id = producto._id
        let cantidad = producto.cantidad
        client.query('SELECT * FROM Productos WHERE _id=($1)', [_id])
            .then(response => {
                let prod = response.rows[0]
                let cantidadGuardada = parseInt(prod.cantidad)
                let cantidadVendida = parseInt(cantidad)
                let nuevaCantidad = cantidadGuardada - cantidadVendida
                client.query('UPDATE Productos SET cantidad=($1) WHERE _id=($2)', [nuevaCantidad, _id])
                    .then(resp => {
                        contador++
                        if (contador == req.body.length) {
                            client.end()
                            cargarProductos(req, res, "Producto actualizado con éxito")
                        }
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
    actualizarCadaProducto()
}

function eliminarProducto(req, res) {
    let _id = req.body._id
    const client = new Client(connectionData)
    client.connect()
    client.query('DELETE FROM Productos WHERE _id=($1)', [_id])
        .then(resp => {
            client.end()
            cargarProductos(req, res, "Producto eliminado de la base de datos con éxito")
        })
        .catch(err => {
            console.log(err)
            client.end()
        })
}

function buscarProducto(req, res) {
    const client = new Client(connectionData)
    client.connect()
    client.query('SELECT * FROM Productos WHERE _id=($1)', [req.body._id])
        .then(response => {
            client.end()
            if (response.rows.length > 0) {
                res.status(200).send({
                    producto: response.rows[0],
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
    cargarProductos,
    guardarProducto,
    editarProducto,
    editarProductoCantidades,
    actualizarProductos,
    eliminarProducto,
    buscarProducto
}
