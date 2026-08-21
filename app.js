/*
  PROYECTO FINAL - TIENDA EL TUNEL
  Servidor principal Express.js
  Versión: 1.0
*/

const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// Importar rutas
const authRoutes    = require('./routes/authRoutes');
const adminRoutes   = require('./routes/adminRoutes');
const carritoRoutes = require('./routes/carritoRoutes');
const librosRoutes  = require('./routes/librosRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

// =============================================
// MIDDLEWARES GLOBALES
// =============================================

// Parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesiones
app.use(session({
  secret:            process.env.SESSION_SECRET || 'secreto_el_tunel',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    secure:   false,          // true en producción con HTTPS
    httpOnly: true,
    maxAge:   parseInt(process.env.SESSION_MAX_AGE) || 86400000 // 24 horas
  }
}));

// =============================================
// RUTAS DE LA API
// =============================================

// Rutas de autenticación (login / logout)
app.use('/api/auth', authRoutes);

// Rutas del panel de administración
app.use('/api/admin', adminRoutes);

// Rutas del carrito de compras (con BD)
app.use('/api/carrito', carritoRoutes);

// Rutas de búsqueda de libros (asíncrona)
app.use('/api/libros', librosRoutes);

// =============================================
// RUTAS DE VISTAS HTML
// =============================================

// Página principal de la tienda
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Vista de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Vista del panel de administración (protegida)
app.get('/admin', (req, res) => {
  // Verificar si el usuario está autenticado y es admin
  if (!req.session.usuario || req.session.usuario.rol !== 'admin') {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// =============================================
// INICIO DEL SERVIDOR
// =============================================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Libreria El Tunel - Modo: ${process.env.NODE_ENV || 'desarrollo'}`);
});