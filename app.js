'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy
const { Client } = require('pg')

const ClientesCtrl = require('./controllers/ClientesCtrl')
const ProductosCtrl = require('./controllers/ProductosCtrl')
const ComprasCtrl = require('./controllers/ComprasCtrl')
const FacturasCtrl = require('./controllers/FacturasCtrl')
const VentasCtrl = require('./controllers/VentasCtrl')

const app = express()

//guardar las sesiones iniciadas
app.use(session({
 resave: true,
 saveUninitialized: true,
 secret:'a4f8071f-c873-4447-8ee2'
}));
app.use(cookieParser())

app.use(express.static('public'))
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE")
  res.header("Access-Control-Allow-Headers", "Content-Type")
  next()
})
//body parse para convertir en json
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

//Productos
app.get('/cargarProductos', ProductosCtrl.cargarProductos)
app.post('/guardarProducto', ProductosCtrl.guardarProducto)
app.post('/editarProducto', ProductosCtrl.editarProducto)
app.post('/editarProductoCantidades', ProductosCtrl.editarProductoCantidades)
app.post('/actualizarProductos', ProductosCtrl.actualizarProductos)
app.post('/eliminarProducto', ProductosCtrl.eliminarProducto)
app.post('/buscarProducto', ProductosCtrl.buscarProducto)

//Compras
app.get('/cargarCompras', ComprasCtrl.cargarCompras)
app.post('/guardarCompra', ComprasCtrl.guardarCompra)
app.post('/buscarCompra', ComprasCtrl.buscarCompra)
app.post('/eliminarCompra', ComprasCtrl.eliminarCompra)

//Clientes
app.get('/cargarClientes', ClientesCtrl.cargarClientes)
app.post('/guardarCliente', ClientesCtrl.guardarCliente)
app.post('/editarCliente', ClientesCtrl.editarCliente)
app.post('/eliminarCliente', ClientesCtrl.eliminarCliente)
app.post('/buscarCliente', ClientesCtrl.buscarCliente)
app.post('/buscarClientePorCedula', ClientesCtrl.buscarClientePorCedula)

//Facturas
app.get('/cargarFacturas', FacturasCtrl.cargarFacturas)
app.post('/guardarFactura', FacturasCtrl.guardarFactura)
app.post('/buscarFactura', FacturasCtrl.buscarFactura)

//Ventas
app.get('/cargarVentas', VentasCtrl.cargarVentas)
app.post('/guardarVenta', VentasCtrl.guardarVenta)
app.post('/buscarVenta', VentasCtrl.buscarVenta)

app.use(passport.initialize())
app.use(passport.session())
//configurar autenticacion

const connectionData = {
  user: 'antilopeinteractive',
  server: 'AntilopeInteractive',
  host: 'localhost',
  database: 'Acme',
  password: 'antilope',
  port: 5432,
}
/* const connectionData = {
  user: 'oluzvvpmttvacy',
  server: 'postgres://oluzvvpmttvacy:6d50b85042b4ede32b37d111fef645421f8bc874d5d35a1b80e4d43d5235b8b9@ec2-54-197-48-79.compute-1.amazonaws.com:5432/d9p7ovfif7i7mj',
  host: 'ec2-54-197-48-79.compute-1.amazonaws.com',
  database: 'd9p7ovfif7i7mj',
  password: '6d50b85042b4ede32b37d111fef645421f8bc874d5d35a1b80e4d43d5235b8b9',
  port: 5432,
} */

passport.use(new LocalStrategy(function(username, password, done)
{
 //var passEncriptada = encriptar(username,password)
  const clientLogin = new Client(connectionData)
  clientLogin.connect()
    .then(() => {
      console.log('Conectado a base de datos')
      client.query('SELECT * FROM Usuarios WHERE username=($1) AND password=($2)', [username, password])
        .then(response => {
          if (response.rows.length == 0) {
            return done(null, false, { message: 'La combinación de nombre de usuario y contraseña es incorrecta' })
          } else {
            let usuario = response.rows[0]
            clientLogin.end()
            return done(null, usuario)
          }
        })
        .catch(err => {
          console.log(err);
        })
    })
    .catch(e => console.log(e))
}))

passport.serializeUser(function(user, done){
  done(null, user)
})
passport.deserializeUser(function(user,done){
  done(null,user)
})

//Creación de tablas
const client = new Client(connectionData)
client.connect()
  .then(() => console.log('Conectado a base de datos'))
  .catch(e => console.log)

client.query("CREATE TABLE IF NOT EXISTS Usuarios (_id SERIAL PRIMARY KEY, nombre varchar(50), numeroIdentificacion numeric, telefono numeric, username varchar(20), password varchar(20), cargo smallint);")
  .then(response => {
    console.log("tabla creada")
  })
  .catch(err => {
    console.log(err);
  })
client.query('SELECT * FROM Usuarios WHERE numeroIdentificacion=($1)', [123456])
  .then(response => {
    if (response.rows.length == 0) {
      client.query('INSERT INTO Usuarios (nombre, numeroIdentificacion, telefono, username, password, cargo) VALUES ($1, $2, $3, $4, $5, $6)', ["Aquiles Brinco", 123456, 3214569878, "123456", "adminACME", 1])
        .then(resp => {
          console.log("Usuario creado")
        })
        .catch(err => {
          console.log("Error al crear usuario")
          console.log(err)
        })
    } else {
      console.log("Usuario existente")
      /* client.query('UPDATE Usuarios SET password=($1) WHERE username=($2)', ["admin", "123456"])
        .then(resp => {
          console.log("Usuario actualizado")
        })
        .catch(err => {
          console.log("Error al editar usuario")
          console.log(err)
        }) */
    }
  })
  .catch(err => {
    console.log(err);
  })
client.query('SELECT * FROM Usuarios WHERE numeroIdentificacion=($1)', [654321])
  .then(response => {
    if (response.rows.length == 0) {
      client.query('INSERT INTO Usuarios (nombre, numeroIdentificacion, telefono, username, password, cargo) VALUES ($1, $2, $3, $4, $5, $6)', ["Clara Luz Morena", 654321, 3105426987, "654321", "ventasACME01", 2])
        .then(resp => {
          console.log("Usuario creado")
        })
        .catch(err => {
          console.log("Error al crear usuario")
          console.log(err)
        })
    } else {
      console.log("Usuario existente")
      /* client.query('UPDATE Usuarios SET password=($1) WHERE username=($2)', ["vendedor", "654321"])
        .then(resp => {
          console.log("Usuario actualizado")
        })
        .catch(err => {
          console.log("Error al editar usuario")
          console.log(err)
        }) */
    }
  })
  .catch(err => {
    console.log(err);
  })
client.query("CREATE TABLE IF NOT EXISTS Clientes (_id SERIAL PRIMARY KEY, nombre varchar(50), tipoDocumento char(3), numeroIdentificacion numeric, fechaNacimiento date, telefono numeric, direccion varchar(50), mayorista boolean);")
  .then(response => {
    console.log("tabla creada")
  })
  .catch(err => {
    console.log(err);
  })
client.query("CREATE TABLE IF NOT EXISTS Productos (_id SERIAL PRIMARY KEY, nombre varchar(50), descripcion varchar(100), cantidad integer, precioCompra numeric, precioVenta numeric);")
  .then(response => {
    console.log("tabla creada")
  })
  .catch(err => {
    console.log(err);
  })
client.query("CREATE TABLE IF NOT EXISTS ComprasProductos (_id SERIAL PRIMARY KEY, fechaCompra date, cantidadCompra integer, precioCompra numeric, idProducto integer REFERENCES productos(_id));")
  .then(response => {
    console.log("tabla creada")
  })
  .catch(err => {
    console.log(err);
  })
client.query("CREATE TABLE IF NOT EXISTS Facturas (_id SERIAL PRIMARY KEY, fechaFactura date, idCliente integer REFERENCES clientes(_id), descuento numeric, idVendedor integer REFERENCES usuarios(_id));")
  .then(response => {
    console.log("tabla creada")
  })
  .catch(err => {
    console.log(err);
  })
client.query("CREATE TABLE IF NOT EXISTS Ventas (_id SERIAL PRIMARY KEY, cantidadProducto integer, precioVenta numeric, idProducto integer REFERENCES productos(_id), idFactura integer REFERENCES facturas(_id));")
  .then(response => {
    console.log("tabla creada")
  })
  .catch(err => {
    console.log(err);
  })

//rutas

// INICIO DE SESIÓN
app.post('/api/login', passport.authenticate('local'), function(req, res)
{
  res.json(req.user)
})

// CERRAR SESIÓN
app.post('/api/logout', function(req, res){
  req.logOut()
  return res.status(200).send({
    message: 'Puede continuar'
  })
})

// AUTENTICAR SI EL ADMINISTRADOR ESTÁ LOGGEADO
app.get('/api/loggedinAdmin', function (req, res) {
  if (req.isAuthenticated()) {
    const clientLogin = new Client(connectionData)
    clientLogin.connect()
      .then(() => {
        client.query('SELECT * FROM Usuarios WHERE username=($1)', [req.user.username])
          .then(response => {
            if (response.rows.length == 0) {
              res.status(200).send({
                codigo: 0
              })
            } else {
              let usuario = response.rows[0]
              if (usuario.cargo === 1) {
                clientLogin.end()
                res.status(200).send({
                  usuario: usuario,
                  codigo: 1
                })
              }
              if (usuario.cargo === 2) {
                clientLogin.end()
                res.status(200).send({
                  usuario: usuario,
                  codigo: 2
                })
              }
            }
          })
          .catch(err => {
            console.log(err);
          })
      })
      .catch(e => console.log(e))
  }
  else {
    res.status(200).send({
      codigo: 0
    })
  }
})

// AUTENTICAR EMULADA LOGGEADO
app.get('/api/loggedinAdminPruebas', function (req, res) {
  // let usuario = "asdass"
  let usuario = "123456"
  // let usuario = "654321"
  const clientLogin = new Client(connectionData)
  clientLogin.connect()
    .then(() => {
      client.query('SELECT * FROM Usuarios WHERE username=($1)', [usuario])
        .then(response => {
          if (response.rows.length == 0) {
            res.status(200).send({
              codigo: 0
            })
          } else {
            let usuario = response.rows[0]
            if (usuario.cargo === 1) {
              clientLogin.end()
              res.status(200).send({
                usuario: usuario,
                codigo: 1
              })
            }
            if (usuario.cargo === 2) {
              clientLogin.end()
              res.status(200).send({
                usuario: usuario,
                codigo: 2
              })
            }
          }
        })
        .catch(err => {
          console.log(err);
        })
    })
    .catch(e => console.log(e))
})

// AUTENTICAR SI EL ADMINISTRADOR ESTÁ LOGGEADO
app.get('/api/loggedin', function (req, res) {
  if (req.isAuthenticated()) {
    const clientLogin = new Client(connectionData)
    clientLogin.connect()
      .then(() => {
        client.query('SELECT * FROM Usuarios WHERE username=($1))', [req.user.username])
          .then(response => {
            if (response.rows.length == 0) {
              res.status(200).send({
                codigo: 0
              })
            } else {
              let usuario = response.rows[0]
              clientLogin.end()
              res.status(200).send({
                usuario: usuario,
                codigo: 1
              })
            }
          })
          .catch(err => {
            console.log(err);
          })
      })
      .catch(e => console.log(e))
  }
  else {
    res.status(200).send({
      codigo: 0
    })
  }
})

// AUTENTICAR EMULADA LOGGEADO
app.get('/api/loggedinPruebas', function (req, res) {
  // let usuario = "asdass"
  let usuario = "123456"
  // let usuario = "654321"
  const clientLogin = new Client(connectionData)
  clientLogin.connect()
    .then(() => {
      client.query('SELECT * FROM Usuarios WHERE username=($1)', [usuario])
        .then(response => {
          if (response.rows.length == 0) {
            res.status(200).send({
              codigo: 0
            })
          } else {
            let usuario = response.rows[0]
            clientLogin.end()
            res.status(200).send({
              usuario: usuario,
              codigo: 1
            })
          }
        })
        .catch(err => {
          console.log(err);
        })
    })
    .catch(e => console.log(e))
})

const nodemailer = require("nodemailer");
app.get('/funcionAuxiliar', function (req, res) {
  /* const transporter = nodemailer.createTransport({
    port: 8080,
    host: 'localhost',
    tls: {
      rejectUnauthorized: false
    },
  });

  var message = {
    from: 'noreply@megametricascalidadempresarial.co',
    to: 'ivangutierrezr@gmail.com',
    subject: 'Confirm Email',
    text: 'Please confirm your email',
    html: '<p>Please confirm your email</p>'
  };

  transporter.sendMail(message, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    res.status(200).send({
      message: "correo enviado",
    })
  }); */
  nodemailer.createTestAccount((err, account) => {
    if (err) {
      console.error('Failed to create a testing account');
      console.error(err);
      return process.exit(1);
    }

    console.log('Credentials obtained, sending message...');
    let transporter = nodemailer.createTransport(
      {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      }
    );

    let message = {
      from: 'Megametricas <no-reply@megametricascalidadempresarial.co>',
      to: 'ivangutierrezr@gmail.com',
      subject: 'Nodemailer is unicode friendly',
      text: 'Hello to myself!',
      html: `<p><b>Hello</b> to myself <img src="cid:note@example.com"/></p>
        <p>Here's a nyan cat for you as an embedded attachment:<br/><img src="cid:nyan@example.com"/></p>`,
    };

    transporter.sendMail(message, (error, info) => {
      console.log("enviando")
      if (error) {
        console.log('Error occurred');
        console.log(error.message);
        return process.exit(1);
      }

      console.log('Message sent successfully!');
      console.log(nodemailer.getTestMessageUrl(info));
      res.status(200).send({
        message: "correo enviado",
      })
      
      transporter.close();
    });
  });
})

module.exports = app
