
const express = require('express');
const router = express.Router();

const {
  verificarSesion,
  verificarAdmin
} = require('../middleware/authMiddleware');

const {
  obtenerUsuarios,
  actualizarRol,
  actualizarEstado,
  obtenerRoles
} = require('../controllers/adminController');

const {
  crearLibro,
  obtenerInventario,
  agregarStock,
  obtenerMasVendidos,
  obtenerResumen
} = require('../controllers/adminLibrosController');

router.use(verificarSesion, verificarAdmin);

// Administración de usuarios
router.get('/usuarios', obtenerUsuarios);
router.patch('/usuarios/:id/rol', actualizarRol);
router.patch('/usuarios/:id/estado', actualizarEstado);
router.get('/roles', obtenerRoles);

// Administración de libros
router.get('/resumen', obtenerResumen);
router.get('/libros', obtenerInventario);
router.post('/libros', crearLibro);
router.patch('/libros/:id/stock', agregarStock);
router.get('/mas-vendidos', obtenerMasVendidos);

module.exports = router;
