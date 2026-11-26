const { Role } = require('../models/relationals');
const { getAccessControl } = require('../rbac/accessControl');

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function can(ac, roleName, resource, action, possession) {
  if (!ac.hasRole(roleName)) return false;
  return ac.can(roleName)[`${action}${cap(possession)}`](resource).granted;
}

const isApi = (req) => req.originalUrl.startsWith('/api');

// API: responde JSON. Web: 401 -> redirige a /login; 403 -> pagina de error 403
function deny(req, res, next, status, key) {
  if (isApi(req)) return res.status(status).json({ message: req.__(key) });
  if (status === 401) return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
  const err = new Error(req.__(key));
  err.status = status;
  return next(err);
}

function authorize(resource, action, possession = 'any', getOwnerId) {
  return async function authorizeMiddleware(req, res, next) {
    try {
      if (!req.user) return deny(req, res, next, 401, 'common.unauthorized');

      const role = await Role.findByPk(req.user.role_id);
      if (!role) return deny(req, res, next, 403, 'common.forbidden');

      const ac = getAccessControl();
      if (can(ac, role.name, resource, action, 'any')) return next();

      if (possession === 'own' && can(ac, role.name, resource, action, 'own')) {
        const ownerId = getOwnerId ? await getOwnerId(req) : null;
        if (ownerId !== null && ownerId !== undefined && Number(ownerId) === Number(req.user.id)) {
          return next();
        }
      }

      return deny(req, res, next, 403, 'common.forbidden');
    } catch (err) {
      next(err);
    }
  };
}

module.exports = authorize;