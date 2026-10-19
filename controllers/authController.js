
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// ─── LOGIN ─────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email y contraseña son requeridos",
      });
    }

    const resultado = await pool.query(
      `SELECT
          u.id,
          u.nombre,
          u.email,
          u.password,
          r.nombre AS rol
       FROM public.usuarios u
       JOIN public.roles r ON u.rol_id = r.id
       WHERE LOWER(u.email) = LOWER($1)
         AND u.activo = true`,
      [email.trim()]
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

    // Guardar los datos del usuario en la sesión
    req.session.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    // Esperar a que la sesión se guarde antes de responder
    req.session.save((error) => {
      if (error) {
        console.error("Error al guardar sesión:", error);

        return res.status(500).json({
          status: "error",
          message: "No se pudo guardar la sesión",
        });
      }

      return res.json({
        status: "success",
        data: {
          usuario: req.session.usuario,
        },
      });
    });
  } catch (error) {
    console.error("Error en login:", error);

    return res.status(500).json({
      status: "error",
      message: "Error del servidor",
    });
  }
};

// ─── LOGOUT ────────────────────────────────────────────
const logout = (req, res) => {
  if (!req.session) {
    return res.json({
      status: "success",
      message: "Sesión ya inexistente",
    });
  }

  req.session.destroy((error) => {
    if (error) {
      console.error("Error al cerrar sesión:", error);

      return res.status(500).json({
        status: "error",
        message: "Error al cerrar sesión",
      });
    }

    res.clearCookie("connect.sid");

    return res.json({
      status: "success",
      message: "Sesión cerrada correctamente",
    });
  });
};

// ─── REGISTRO ──────────────────────────────────────────
const registro = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (
      typeof nombre !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !nombre.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        status: "error",
        message: "Nombre, email y contraseña son requeridos",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    // Comprobar si el correo ya está registrado
    const existe = await pool.query(
      `SELECT id
       FROM public.usuarios
       WHERE LOWER(email) = $1`,
      [emailNormalizado]
    );

    if (existe.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "El email ya está registrado",
      });
    }

    // Los registros públicos siempre son clientes
   const rolCliente = await pool.query(
  `SELECT id FROM public.roles WHERE nombre = 'cliente' LIMIT 1`
);

    if (rolCliente.rows.length === 0) {
      return res.status(500).json({
        status: "error",
        message: "No existe el rol cliente en la tabla roles",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = await pool.query(
      `INSERT INTO public.usuarios
         (nombre, email, password, rol_id, activo)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, nombre, email, rol_id`,
      [
        nombre.trim(),
        emailNormalizado,
        hashedPassword,
        rolCliente.rows[0].id,
      ]
    );

    return res.status(201).json({
      status: "success",
      message: "Usuario registrado correctamente",
      data: {
        usuario: nuevoUsuario.rows[0],
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);

    // Protección adicional para correos duplicados si existe
    // una restricción UNIQUE en la base de datos.
    if (error.code === "23505") {
      return res.status(409).json({
        status: "error",
        message: "El email ya está registrado",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Error del servidor",
    });
  }
};

// ─── VERIFICAR SESIÓN ──────────────────────────────────
const verificarSesion = (req, res) => {
  if (!req.session?.usuario) {
    return res.status(401).json({
      status: "error",
      message: "No hay sesión activa",
    });
  }

  return res.json({
    status: "success",
    data: {
      usuario: req.session.usuario,
    },
  });
};

module.exports = {
  login,
  logout,
  registro,
  verificarSesion,
};
