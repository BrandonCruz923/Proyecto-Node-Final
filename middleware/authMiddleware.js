const verificarSesion = (req, res, next) => {
    if (req.session && req.session.usuario) return next();
    res.status(401).json({ status: 'error', message: 'Acceso no autorizado' });
};

const verificarAdmin = (req, res, next) => {
    if (req.session && req.session.usuario && req.session.usuario.rol === 'admin') return next();
    res.status(403).json({ status: 'error', message: 'Se requiere rol de administrador' });
};

module.exports = { verificarSesion, verificarAdmin };
