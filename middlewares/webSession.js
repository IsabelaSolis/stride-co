const authService = require('../services/auth.service');
const { can } = require('../rbac/can');

const ACCESS_COOKIE = 'access_token';

// En las rutas web el JWT viaja en una cookie. Este middleware la lee, valida el
// token y llena req.user (y res.locals.currentUser para las vistas). No bloquea
// nada: si no hay sesion valida solo deja req.user vacio.
async function loadWebUser(req, res, next) {
  try {
    const token = req.cookies && req.cookies[ACCESS_COOKIE];
    if (!token || req.originalUrl.startsWith('/api')) return next();

    let payload = null;
    try {
      payload = authService.verifyToken(token);
    } catch {
      res.clearCookie(ACCESS_COOKIE); // token invalido o vencido
    }

    if (payload) {
      const user = await authService.findActiveUser(payload.sub);
      if (user) {
        req.user = user;
        res.locals.currentUser = user;
        // para mostrar u ocultar botones y menus (no sustituye a authorize en la ruta)
        const roleName = user.role && user.role.name;
        res.locals.can = (resource, action, possession) => can(roleName, resource, action, possession);
      } else {
        res.clearCookie(ACCESS_COOKIE); // usuario eliminado o inactivo
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { loadWebUser, ACCESS_COOKIE };