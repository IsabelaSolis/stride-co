const { AccessControl } = require('accesscontrol');
const { Role, Permission } = require('../models/relationals');

let ac = null;

// Lee Role -> role_permissions -> Permission de la BD y arma los grants.
async function loadAccessControl() {
  const roles = await Role.findAll({
    include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }]
  });

  const grants = [];
  for (const role of roles) {
    for (const perm of role.permissions) {
      // key = recurso:accion:alcance  ->  orders:read:own
      const parts = perm.key.split(':');
      if (parts.length !== 3 || parts.some((p) => !p)) {
        console.warn(`RBAC: permiso ignorado, no cumple recurso:accion:alcance -> "${perm.key}"`);
        continue;
      }
      const [resource, action, possession] = parts;
      grants.push({
        role: role.name,
        resource,
        action: `${action}:${possession}`,
        attributes: '*'
      });
    }
  }

  if (grants.length === 0) {
    console.warn('RBAC: no hay permisos en la BD (Role / Permission / role_permissions). Todo acceso protegido dara 403.');
  }

  ac = new AccessControl(grants);
  return ac;
}

function getAccessControl() {
  if (!ac) throw new Error('AccessControl no ha sido cargado. Llama loadAccessControl() al iniciar.');
  return ac;
}

module.exports = { loadAccessControl, getAccessControl };