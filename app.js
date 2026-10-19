
/*
  PROYECTO FINAL - TIENDA EL TÚNEL
  Servidor principal Express.js
*/

const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const carritoRoutes = require('./routes/carritoRoutes');
const librosRoutes = require('./routes/librosRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================
// MIDDLEWARES GLOBALES
// =============================================

// Procesar solicitudes JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesiones ANTES de las rutas
app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto_el_tunel',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // En producción con HTTPS, configurar correctamente
    httpOnly: true,
    sameSite: 'lax',
    maxAge: Number(process.env.SESSION_MAX_AGE) || 86400000
  }
}));

// Servir archivos públicos
app.use(express.static(path.join(__dirname, 'public')));

// =============================================
// RUTAS DE LA API
// =============================================

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/libros', librosRoutes);

// =============================================
// VISTAS HTML
// =============================================

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login
app.get('/login', (req, res) => {
  // Si ya inició sesión, dirigirlo según su rol
  if (req.session?.usuario) {
    if (req.session.usuario.rol === 'admin') {
      return res.redirect('/admin');
    }

    return res.redirect('/');
  }

  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Panel de administración protegido
app.get('/admin', (req, res) => {
  // Verificar que exista una sesión de administrador
  if (!req.session.usuario || req.session.usuario.rol !== 'admin') {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
// =============================================
// MANEJO DE ERRORES
// =============================================

app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);

  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor'
  });
});

// =============================================
// INICIO DEL SERVIDOR
// =============================================

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Login: http://localhost:${PORT}/login`);
  console.log(`Panel admin: http://localhost:${PORT}/admin`);
});
