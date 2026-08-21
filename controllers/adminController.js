const pool = require('../config/db');

const obtenerUsuarios = async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT u.id, u.nombre, u.email, u.activo, r.nombre AS rol, u.rol_id
             FROM usuarios u
             JOIN roles r ON u.rol_id = r.id
             ORDER BY u.id ASC`
        );
        res.json({ status: 'success', data: { usuarios: resultado.rows } });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ status: 'error', message: 'Error del servidor' });
    }
};

const actualizarRol = async (req, res) => {
    const { id } = req.params;
    const { rol_id } = req.body;
    try {
        const resultado = await pool.query(
            'UPDATE usuarios SET rol_id = $1 WHERE id = $2 RETURNING id, nombre, email, rol_id',
            [rol_id, id]
        );
        if (resultado.rows.length === 0)
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        res.json({ status: 'success', data: { usuario: resultado.rows[0] } });
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        res.status(500).json({ status: 'error', message: 'Error del servidor' });
    }
};

const actualizarEstado = async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;
    try {
        const resultado = await pool.query(
            'UPDATE usuarios SET activo = $1 WHERE id = $2 RETURNING id, nombre, email, activo',
            [activo, id]
        );
        if (resultado.rows.length === 0)
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        res.json({ status: 'success', data: { usuario: resultado.rows[0] } });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ status: 'error', message: 'Error del servidor' });
    }
};

const obtenerRoles = async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM roles ORDER BY id ASC');
        res.json({ status: 'success', data: { roles: resultado.rows } });
    } catch (error) {
        console.error('Error al obtener roles:', error);
        res.status(500).json({ status: 'error', message: 'Error del servidor' });
    }
};

module.exports = { obtenerUsuarios, actualizarRol, actualizarEstado, obtenerRoles };
