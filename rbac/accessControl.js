const { AccessControl } = require('accesscontrol');
const { Role, Permission } = require('../models/relationals');
let ac = null;

// Lee Role -> role_permissions -> Permission de la BD.
async function loadAccessControl() {
  const roles = await Role.findAll({
    include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }]
  });

  const grants = [];
  for (const role of roles) {
    for (const perm of role.permissions) {
      // key = recurso:accion:alcance  ->  orders:read:own
      //separa cada key en tres partes
      const [resource, action, possession] = perm.key.split(':');
      grants.push({
        role: role.name,
        resource,
        action: `${action}:${possession}`,
        attributes: '*'
      });
    }
  }

  if (grants.length === 0) {
    console.warn('No hay permisos en la BD. Todo acceso protegido dara 403.');
  }

  ac = new AccessControl(grants);
  return ac;
}

function getAccessControl() {
  if (!ac) throw new Error('AccessControl no ha sido cargado');
  return ac;
}

module.exports = { loadAccessControl, getAccessControl };