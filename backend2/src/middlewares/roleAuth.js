const roleAuth = {
  isSuperAdmin(req, res, next) {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requiere rol de Super Administrador.'
      });
    }
    next();
  },

  isAdminOrAbove(req, res, next) {
    const allowedRoles = ['super_admin', 'admin_empresa', 'admin'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requiere rol de administrador.'
      });
    }
    next();
  },

  isCompanyAdmin(req, res, next) {
    const allowedRoles = ['super_admin', 'admin_empresa'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requiere rol de administrador de empresa.'
      });
    }
    next();
  }
};

module.exports = roleAuth;
