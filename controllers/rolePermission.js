const { Role, Permission } = require('../models/relationals');
const { parseId } = require('../utils/http');

// Tabla intermedia role_permissions (la crea la asociacion Role <-> Permission)
const rolePermissions = () => Role.associations.permissions.through.model;

//create
async function create(req, res, next) {
  try {
    const roleId = parseId(req.body.roleId);
    const permissionId = parseId(req.body.permissionId);
    if (roleId === null || permissionId === null) {
      return res.status(400).json({ message: req.__('common.validationError') });
    }
    // si el rol o el permiso no existen, la llave foranea responde 400;
    // si la pareja ya existe, la llave primaria compuesta responde 400
    const record = await rolePermissions().create({ role_id: roleId, permission_id: permissionId });
    res.status(201).json({ message: req.__('rolePermissions.created'), data: record });
  } catch (err) {
    next(err);
  }
}

//find
async function list(req, res, next) {
  try {
    const records = await rolePermissions().findAll({ order: [['role_id', 'ASC'], ['permission_id', 'ASC']] });
    res.json({ message: req.__('rolePermissions.list'), data: records });
  } catch (err) {
    next(err);
  }
}

//find by id
async function find(req, res, next) {
  try {
    const roleId = parseId(req.params.roleId);
    if (roleId === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const role = await Role.findByPk(roleId, {
      include: { model: Permission, as: 'permissions', through: { attributes: [] } }
    });
    if (!role) return res.status(404).json({ message: req.__('roles.notFound') });
    res.json({ message: req.__('rolePermissions.found'), data: role.permissions });
  } catch (err) {
    next(err);
  }
}

//destroy
async function destroy(req, res, next) {
  try {
    const roleId = parseId(req.params.roleId);
    const permissionId = parseId(req.params.permissionId);
    if (roleId === null || permissionId === null) {
      return res.status(400).json({ message: req.__('common.invalidId') });
    }
    const deleted = await rolePermissions().destroy({ where: { role_id: roleId, permission_id: permissionId } });
    if (!deleted) return res.status(404).json({ message: req.__('rolePermissions.notFound') });
    res.json({ message: req.__('rolePermissions.deleted'), data: { roleId, permissionId } });
  } catch (err) {
    next(err);
  }
}

module.exports = {create, list, find,destroy}