const { Role } = require('../models/relationals');
const { getAccessControl } = require('../rbac/accessControl');

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function can(ac, roleName, resource, action, possession) {
  if (!ac.hasRole(roleName)) return false;
  return ac.can(roleName)[`${action}${cap(possession)}`](resource).granted;
}
function authorize(resource, action, possession = 'any', getOwnerId) {
  return async function authorizeMiddleware(req, res, next) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const role = await Role.findByPk(req.user.role_id);
      if (!role) return res.status(403).json({ message: 'Forbidden' });

      const ac = getAccessControl();
      if (can(ac, role.name, resource, action, 'any')) return next();

      if (possession === 'own' && can(ac, role.name, resource, action, 'own')) {
        const ownerId = getOwnerId ? await getOwnerId(req) : null;
        if (ownerId !== null && ownerId !== undefined && Number(ownerId) === Number(req.user.id)) {
          return next();
        }
      }

      return res.status(403).json({ message: 'Forbidden' });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = authorize;