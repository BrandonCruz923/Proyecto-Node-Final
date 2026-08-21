const router = require('express').Router();
const carritoController = require('../controllers/carritoController');

router.get('/', carritoController.obtenerCarrito);          // GET /api/carrito
router.post('/agregar', carritoController.agregarItem);   // POST /api/carrito/agregar
router.delete('/eliminar/:id_libro', carritoController.eliminarItem);
router.delete('/vaciar', carritoController.vaciarCarrito);  // DELETE /api/carrito/vaciar
router.post('/pagar', carritoController.procesarPago);     // POST /api/carrito/pagar

module.exports = router;