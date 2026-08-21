const pool = require('../config/db');

// ─────────────────────────────────────────
// 🔒 Helper: verificar sesión activa
// ─────────────────────────────────────────
const requireUser = (req, res) => {
  if (!req.session || !req.session.usuario) {
    res.status(401).json({
      status: 'error',
      message: 'Debes iniciar sesión para acceder al carrito'
    });
    return null;
  }
  return req.session.usuario;
};

// ─────────────────────────────────────────
// GET /api/carrito
// ─────────────────────────────────────────
const obtenerCarrito = async (req, res) => {
  const usuario = requireUser(req, res);
  if (!usuario) return;

  const usuario_id = usuario.id;

  try {
    const result = await pool.query(
      `SELECT ci.id AS item_id,
              l.titulo,
              l.autor,
              ci.cantidad,
              ci.precio_unit,
              (ci.cantidad * ci.precio_unit) AS subtotal
       FROM carrito_items ci
       JOIN carritos c ON ci.id_carrito = c.id
       JOIN libros l ON ci.id_libro = l.id
       WHERE c.id_usuario = $1 AND c.completado = false
       ORDER BY ci.id`,
      [usuario_id]
    );

    const total = result.rows.reduce(
      (sum, item) => sum + parseFloat(item.subtotal),
      0
    );

    res.json({
      status: 'success',
      data: {
        items: result.rows,
        total: total.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ status: 'error', message: 'Error del servidor' });
  }
};

// ─────────────────────────────────────────
// POST /api/carrito/agregar
// ─────────────────────────────────────────
const agregarItem = async (req, res) => {
  const usuario = requireUser(req, res);
  if (!usuario) return;

  const usuario_id = usuario.id;
  const { libro_id, cantidad } = req.body;

  // ✅ Validar que libro_id fue enviado
  if (!libro_id) {
    return res.status(400).json({
      status: 'error',
      message: 'El campo libro_id es requerido'
    });
  }

  // ✅ Validar que el libro existe en BD
  const libroExiste = await pool.query(
    `SELECT id FROM libros WHERE id = $1`,
    [libro_id]
  );

  if (libroExiste.rows.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'El libro no existe'
    });
  }

  const cantidadFinal = cantidad || 1;

  try {
    // Buscar o crear carrito activo
    let carritoRes = await pool.query(
      `SELECT id FROM carritos
       WHERE id_usuario = $1 AND completado = false`,
      [usuario_id]
    );

    let carrito_id;

    if (carritoRes.rows.length === 0) {
      const nuevoCarrito = await pool.query(
        `INSERT INTO carritos (id_usuario, completado)
         VALUES ($1, false) RETURNING id`,
        [usuario_id]
      );
      carrito_id = nuevoCarrito.rows[0].id;
    } else {
      carrito_id = carritoRes.rows[0].id;
    }

    // Obtener precio del libro
    const libroRes = await pool.query(
      `SELECT precio FROM libros WHERE id = $1`,
      [libro_id]
    );
    const precio = libroRes.rows[0].precio;

    // Verificar si el item ya está en el carrito
    const itemExiste = await pool.query(
      `SELECT id, cantidad FROM carrito_items
       WHERE id_carrito = $1 AND id_libro = $2`,
      [carrito_id, libro_id]
    );

    if (itemExiste.rows.length > 0) {
      // Actualizar cantidad
      await pool.query(
        `UPDATE carrito_items
         SET cantidad = cantidad + $1
         WHERE id_carrito = $2 AND id_libro = $3`,
        [cantidadFinal, carrito_id, libro_id]
      );
    } else {
      // Insertar nuevo item
      await pool.query(
        `INSERT INTO carrito_items (id_carrito, id_libro, cantidad, precio_unit)
         VALUES ($1, $2, $3, $4)`,
        [carrito_id, libro_id, cantidadFinal, precio]
      );
    }

    res.status(201).json({
      status: 'success',
      message: 'Libro agregado al carrito'
    });
  } catch (error) {
    console.error('Error al agregar item:', error);
    res.status(500).json({ status: 'error', message: 'Error del servidor' });
  }
};

// ─────────────────────────────────────────
// DELETE /api/carrito/eliminar/:id_libro
// ─────────────────────────────────────────
const eliminarItem = async (req, res) => {
  const usuario = requireUser(req, res);
  if (!usuario) return;

  const usuario_id = usuario.id;
  const { id_libro } = req.params;

  try {
    await pool.query(
      `DELETE FROM carrito_items
       USING carritos c
       WHERE carrito_items.id_carrito = c.id
         AND c.id_usuario = $1
         AND c.completado = false
         AND carrito_items.id_libro = $2`,
      [usuario_id, id_libro]
    );

    res.json({
      status: 'success',
      message: 'Libro eliminado del carrito'
    });
  } catch (error) {
    console.error('Error al eliminar item:', error);
    res.status(500).json({ status: 'error', message: 'Error del servidor' });
  }
};

// ─────────────────────────────────────────
// DELETE /api/carrito/vaciar
// ─────────────────────────────────────────
const vaciarCarrito = async (req, res) => {
  const usuario = requireUser(req, res);
  if (!usuario) return;

  const usuario_id = usuario.id;

  try {
    await pool.query(
      `DELETE FROM carrito_items
       USING carritos c
       WHERE carrito_items.id_carrito = c.id
         AND c.id_usuario = $1
         AND c.completado = false`,
      [usuario_id]
    );

    res.json({
      status: 'success',
      message: 'Carrito vaciado correctamente'
    });
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({ status: 'error', message: 'Error del servidor' });
  }
};

// ─────────────────────────────────────────
// POST /api/carrito/pagar
// ─────────────────────────────────────────
const procesarPago = async (req, res) => {
  const usuario = requireUser(req, res);
  if (!usuario) return;

  const usuario_id = usuario.id;
  const client = await pool.connect(); // 🔑 Cliente dedicado para transacción

  try {
    await client.query('BEGIN'); // 🟢 Inicia transacción

    // 1) Traer items del carrito activo
    const items = await client.query(
      `SELECT ci.id_carrito, ci.id_libro, ci.cantidad, ci.precio_unit
       FROM carrito_items ci
       JOIN carritos c ON ci.id_carrito = c.id
       WHERE c.id_usuario = $1 AND c.completado = false`,
      [usuario_id]
    );

    if (items.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 'error',
        message: 'El carrito está vacío'
      });
    }

    // 2) Calcular total
    const total = items.rows.reduce(
      (sum, item) => sum + parseFloat(item.precio_unit) * item.cantidad,
      0
    );

    // 3) Crear pedido
    const pedidoRes = await client.query(
      `INSERT INTO pedidos (id_usuario, total, estado)
       VALUES ($1, $2, 'pendiente')
       RETURNING id`,
      [usuario_id, total]
    );
    const pedido_id = pedidoRes.rows[0].id;

    // 4) Insertar items del pedido
    for (const item of items.rows) {
      await client.query(
        `INSERT INTO pedido_items (id_pedido, id_libro, cantidad, precio_unit)
         VALUES ($1, $2, $3, $4)`,
        [pedido_id, item.id_libro, item.cantidad, item.precio_unit]
      );
    }

    // 5) Vaciar carrito
    await client.query(
      `DELETE FROM carrito_items
       USING carritos c
       WHERE carrito_items.id_carrito = c.id
         AND c.id_usuario = $1 AND c.completado = false`,
      [usuario_id]
    );

    // 6) Marcar carrito como completado
    await client.query(
      `UPDATE carritos SET completado = true
       WHERE id_usuario = $1 AND completado = false`,
      [usuario_id]
    );

    await client.query('COMMIT'); // ✅ Todo OK → confirmar

    res.status(201).json({
      status: 'success',
      message: 'Pago procesado correctamente',
      data: { pedido_id, total }
    });

  } catch (error) {
    await client.query('ROLLBACK'); // ❌ Error → revertir todo
    console.error('Error al procesar pago:', error);
    res.status(500).json({ status: 'error', message: 'Error del servidor' });
  } finally {
    client.release(); // 🔓 Liberar conexión siempre
  }
};

// ─────────────────────────────────────────
// 📤 Exportar funciones
// ─────────────────────────────────────────
module.exports = {
  obtenerCarrito,
  agregarItem,
  eliminarItem,
  vaciarCarrito,
  procesarPago
};