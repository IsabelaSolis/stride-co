const { Role, Permission } = require('../models/relationals');
const { parseId } = require('../utils/http');

const withPermissions = { model: Permission, as: 'permissions', through: { attributes: [] } };

// permissionIds debe ser un arreglo de ids enteros positivos
const validPermissionIds = (ids) => Array.isArray(ids) && ids.every((id) => parseId(id) !== null);

// create
async function create(req, res, next) {
  try {
    const { name, description, permissionIds } = req.body;
    if (permissionIds !== undefined && !validPermissionIds(permissionIds)) {
      return res.status(400).json({ message: req.__('common.validationError') });
    }
    const role = await Role.create({ name, description });
    if (permissionIds) await role.setPermissions(permissionIds);

    const created = await Role.findByPk(role.id, { include: withPermissions });
    res.status(201).json({ message: req.__('roles.created'), data: created });
  } catch (err) {
    next(err);
  }
}

// list
async function list(req, res, next) {
  try {
    const roles = await Role.findAll({ include: withPermissions, order: [['id', 'ASC']] });
    res.json({ message: req.__('roles.list'), data: roles });
  } catch (err) {
    next(err);
  }
}

// find by id
async function find(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const role = await Role.findByPk(id, { include: withPermissions });
    if (!role) return res.status(404).json({ message: req.__('roles.notFound') });
    res.json({ message: req.__('roles.found'), data: role });
  } catch (err) {
    next(err);
  }
}

// update
async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const role = await Role.findByPk(id);
    if (!role) return res.status(404).json({ message: req.__('roles.notFound') });

    const { name, description, permissionIds } = req.body;
    if (permissionIds !== undefined && !validPermissionIds(permissionIds)) {
      return res.status(400).json({ message: req.__('common.validationError') });
    }
    await role.update({
      name: name ?? role.name,
      description: description ?? role.description
    });
    if (permissionIds) await role.setPermissions(permissionIds);

    const updated = await Role.findByPk(role.id, { include: withPermissions });
    res.json({ message: req.__('roles.updated'), data: updated });
  } catch (err) {
    next(err);
  }
}

// destroy
async function destroy(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const role = await Role.findByPk(id);
    if (!role) return res.status(404).json({ message: req.__('roles.notFound') });
    await role.destroy();
    res.json({ message: req.__('roles.deleted'), data: role });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, find, update, destroy };