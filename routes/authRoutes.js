/* Rutas de autenticación */
const express = require('express');
const router  = express.Router();
const { login, logout, registro, verificarSesion } = require('../controllers/authController');

router.post('/login',    login);            // Iniciar sesión
router.post('/logout',   logout);           // Cerrar sesión
router.post('/registro', registro);         // Registrar usuario
router.get('/sesion',    verificarSesion);  // Verificar sesión activa

module.exports = router;