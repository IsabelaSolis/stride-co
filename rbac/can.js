const { getAccessControl } = require('./accessControl');

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// true si el rol tiene el permiso (recurso, accion, alcance) segun la matriz RBAC de la base
function can(roleName, resource, action, possession = 'any') {
  if (!roleName) return false;
  const ac = getAccessControl();
  if (!ac.hasRole(roleName)) return false;
  return ac.can(roleName)[`${action}${cap(possession)}`](resource).granted;
}

module.exports = { can };