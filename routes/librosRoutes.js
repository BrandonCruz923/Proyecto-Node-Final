const express = require('express');
const router = express.Router();
const { obtenerLibros, buscarLibros, obtenerLibroPorId } = require('../controllers/librosController');

// ⚠️ IMPORTANTE: /buscar debe ir ANTES que /:id
router.get('/buscar', buscarLibros);
router.get('/', obtenerLibros);
router.get('/:id', obtenerLibroPorId);

module.exports = router;