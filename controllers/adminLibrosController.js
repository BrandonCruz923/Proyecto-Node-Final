
const pool = require('../config/db');

// GET /api/admin/resumen
const obtenerResumen = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        COUNT(*)::int AS total_libros,
        COALESCE(SUM(stock), 0)::int AS unidades_stock,
        COUNT(*) FILTER (WHERE stock = 0)::int AS agotados
      FROM libros
    `);

    res.json({
      status: 'success',
      data: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error en resumen:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener el resumen'
    });
  }
};

// GET /api/admin/libros
const obtenerInventario = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT id, titulo, autor, categoria, precio, stock, imagen
      FROM libros
      ORDER BY titulo ASC
    `);

    res.json({
      status: 'success',
      data: { libros: resultado.rows }
    });
  } catch (error) {
    console.error('Error en inventario:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener el inventario'
    });
  }
};

// POST /api/admin/libros
const crearLibro = async (req, res) => {
  const {
    titulo, autor, descripcion, categoria,
    precio, stock, imagen
  } = req.body;

  if (
    !titulo?.trim() ||
    !autor?.trim() ||
    !categoria?.trim() ||
    precio === undefined ||
    !Number.isFinite(Number(precio)) ||
    Number(precio) < 0 ||
    !Number.isInteger(Number(stock)) ||
    Number(stock) < 0
  ) {
    return res.status(400).json({
      status: 'error',
      message: 'Revisa título, autor, categoría, precio y stock'
    });
  }

  try {
    const resultado = await pool.query(`
      INSERT INTO libros
        (titulo, autor, descripcion, categoria, precio, stock, imagen)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, titulo, autor, precio, stock
    `, [
      titulo.trim(),
      autor.trim(),
      descripcion || '',
      categoria.trim(),
      Number(precio),
      Number(stock),
      imagen || null
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Libro registrado correctamente',
      data: { libro: resultado.rows[0] }
    });
  } catch (error) {
    console.error('Error al registrar libro:', error);
    res.status(500).json({
      status: 'error',
      message: 'No se pudo registrar el libro. Verifica las columnas obligatorias.'
    });
  }
};

// PATCH /api/admin/libros/:id/stock
const agregarStock = async (req, res) => {
  const id = Number(req.params.id);
  const cantidad = Number(req.body.cantidad);

  if (
    !Number.isInteger(id) || id <= 0 ||
    !Number.isInteger(cantidad) || cantidad <= 0
  ) {
    return res.status(400).json({
      status: 'error',
      message: 'El ID y la cantidad deben ser enteros positivos'
    });
  }

  try {
    const resultado = await pool.query(`
      UPDATE libros
      SET stock = stock + $1
      WHERE id = $2
      RETURNING id, titulo, stock
    `, [cantidad, id]);

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Libro no encontrado'
      });
    }

    res.json({
      status: 'success',
      message: 'Stock actualizado correctamente',
      data: { libro: resultado.rows[0] }
    });
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    res.status(500).json({
      status: 'error',
      message: 'No se pudo actualizar el stock'
    });
  }
};

// GET /api/admin/mas-vendidos
const obtenerMasVendidos = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        l.id,
        l.titulo,
        l.autor,
        l.imagen,
        COALESCE(SUM(pi.cantidad), 0)::bigint AS unidades_vendidas,
        COALESCE(
          SUM(pi.cantidad * pi.precio_unit), 0
        )::numeric(12,2) AS importe_vendido
      FROM libros l
      LEFT JOIN pedido_items pi ON pi.id_libro = l.id
      LEFT JOIN pedidos p
        ON p.id = pi.id_pedido
       AND p.estado = 'completado'
      GROUP BY l.id, l.titulo, l.autor, l.imagen
      ORDER BY unidades_vendidas DESC, l.titulo ASC
      LIMIT 10
    `);

    res.json({
      status: 'success',
      data: { libros: resultado.rows }
    });
  } catch (error) {
    console.error('Error en ranking:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al consultar los libros más vendidos'
    });
  }
};

module.exports = {
  obtenerResumen,
  obtenerInventario,
  crearLibro,
  agregarStock,
  obtenerMasVendidos
};
