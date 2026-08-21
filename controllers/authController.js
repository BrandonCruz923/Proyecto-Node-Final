// controllers/authController.js
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// ─── LOGIN ───────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email y contraseña son requeridos",
      });
    }

    // ✅ Forzamos schema public para que no haya ambigüedad
    const resultado = await pool.query(
      `SELECT u.id,
              u.nombre,
              u.email,
              u.password,
              r.nombre AS rol
       FROM public.usuarios u
       JOIN public.roles r ON u.rol_id = r.id
       WHERE u.email = $1 AND u.activo = true`,
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Credenciales incorrectas",
      });
    }

    const usuario = resultado.rows[0];

    const passwordValida = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordValida) {
      return res.status(401).json({
        status: "error",
        message: "Credenciales incorrectas",
      });
    }

    // Guardar sesión (si está disponible)
    req.session.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    return res.json({
      status: "success",
      data: {
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error.message);
    console.error(error.stack);
    return res.status(500).json({
      status: "error",
      message: "Error del servidor",
      detalle: error.message, // temporal para depuración
    });
  }
};

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
const logout = (req, res) => {
  if (!req.session) {
    return res.json({
      status: "success",
      message: "Sesión ya inexistente",
    });
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Error al cerrar sesión",
      });
    }
    res.json({
      status: "success",
      message: "Sesión cerrada correctamente",
    });
  });
};

// ─── REGISTRO ────────────────────────────────────────────────────────────────
const registro = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Todos los campos son requeridos",
      });
    }

    // Verificar si el email ya existe
    const existe = await pool.query(
      "SELECT id FROM public.usuarios WHERE email = $1",
      [email]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "El email ya está registrado",
      });
    }

    // Encriptar contraseña (guardamos en password_hash)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Obtener rol de cliente (si existe en roles.nombre = 'cliente')
    const rolCliente = await pool.query(
      `SELECT id FROM public.roles WHERE nombre = 'admin' LIMIT 1`
    );

    if (rolCliente.rows.length === 0) {
      return res.status(400).json({
        status: "error",
        message:
          "No existe el rol 'cliente' en la tabla roles. Verifica roles.nombre.",
      });
    }

    const rolId = rolCliente.rows[0].id;

    // Insertar usuario (ajustado a tu esquema)
    const nuevoUsuario = await pool.query(
      `INSERT INTO public.usuarios (nombre, email, password, rol_id, activo)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, nombre, email`,
      [nombre, email, hashedPassword, rolId]
    );

    res.status(201).json({
      status: "success",
      data: {
        usuario: nuevoUsuario.rows[0],
      },
    });
  } catch (error) {
    console.error("❌ Error en registro:", error.message);
    console.error(error.stack);
    res.status(500).json({
      status: "error",
      message: "Error del servidor",
      detalle: error.message,
    });
  }
};

// ─── VERIFICAR SESIÓN ────────────────────────────────────────────────────────
const verificarSesion = (req, res) => {
  if (req.session && req.session.usuario) {
    return res.json({
      status: "success",
      data: {
        usuario: req.session.usuario,
      },
    });
  }

  return res.status(401).json({
    status: "error",
    message: "No hay sesion activa",
  });
};

module.exports = { login, logout, registro, verificarSesion };