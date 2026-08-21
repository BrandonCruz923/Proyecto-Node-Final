const pool = require('../config/db');

// GET /api/libros - Obtener todos los libros
const obtenerLibros = async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM libros ORDER BY creado_en DESC'
    );
    res.json({
      status: 'success',
      results: resultado.rows.length,
      data: { libros: resultado.rows }
    });
  } catch (error) {
    console.error('Error al obtener libros:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener libros' });
  }
};

// GET /api/libros/buscar - Buscar libros por texto o categoría
const buscarLibros = async (req, res) => {
  const { q, categoria } = req.query;

  try {
    let query = 'SELECT * FROM libros WHERE 1=1';
    const params = [];
    let i = 1;

    if (q) {
      query += ` AND (
        LOWER(titulo)       LIKE LOWER($${i}) OR
        LOWER(autor)        LIKE LOWER($${i}) OR
        LOWER(descripcion)  LIKE LOWER($${i}) OR
        LOWER(categoria)    LIKE LOWER($${i})
      )`;
      params.push(`%${q}%`);
      i++;
    }

    if (categoria) {
      query += ` AND LOWER(categoria) = LOWER($${i})`;
      params.push(categoria);
      i++;
    }

    query += ' ORDER BY titulo ASC';

    const resultado = await pool.query(query, params);

    res.json({
      status: 'success',
      results: resultado.rows.length,
      data: { libros: resultado.rows }
    });

  } catch (error) {
    console.error('Error al buscar libros:', error);
    res.status(500).json({ status: 'error', message: 'Error al buscar libros' });
  }
};

// GET /api/libros/:id - Obtener un libro por ID
const obtenerLibroPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query(
      'SELECT * FROM libros WHERE id = $1', [id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Libro no encontrado' });
    }
    res.json({
      status: 'success',
      data: { libro: resultado.rows[0] }
    });
  } catch (error) {
    console.error('Error al obtener libro:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener libro' });
  }
};

module.exports = { obtenerLibros, buscarLibros, obtenerLibroPorId };