/* Rutas del panel de administración (protegidas) */
const express = require('express');
const router  = express.Router();
const { verificarSesion, verificarAdmin } = require('../middleware/authMiddleware');
const {
  obtenerUsuarios,
  actualizarRol,
  actualizarEstado,
  obtenerRoles
} = require('../controllers/adminController');

// Todas las rutas de admin requieren sesión y rol de administrador
router.use(verificarSesion, verificarAdmin);

router.get('/usuarios',                  obtenerUsuarios);   // Listar usuarios
router.patch('/usuarios/:id/rol',        actualizarRol);     // Cambiar rol
router.patch('/usuarios/:id/estado',     actualizarEstado);  // Activar/desactivar
router.get('/roles',                     obtenerRoles);      // Listar roles

module.exports = router;