const { Role, Permission } = require('../models/relationals');

// create
async function create(req, res, next) {
  try {
    const { name, description, permissionIds } = req.body;
    const role = await Role.create({ name, description });
    if (permissionIds) await role.setPermissions(permissionIds);

    const created = await Role.findByPk(role.id, {
      include: { model: Permission, as: 'permissions' }
    });
    res.status(201).json({ message: 'create role', data: created });
  } catch (err) {
    next(err);
  }
}

// list
async function list(req, res, next) {
  try {
    const roles = await Role.findAll({
      include: { model: Permission, as: 'permissions' }
    });
    res.json({ message: 'list of roles', data: roles });
  } catch (err) {
    next(err);
  }
}

// find by id
async function find(req, res, next) {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: { model: Permission, as: 'permissions' }
    });
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json({ message: 'find a role by id', data: role });
  } catch (err) {
    next(err);
  }
}

// update
async function update(req, res, next) {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    const { name, description, permissionIds } = req.body;
    await role.update({
      name: name ?? role.name,
      description: description ?? role.description
    });
    if (permissionIds) await role.setPermissions(permissionIds);

    const updated = await Role.findByPk(role.id, {
      include: { model: Permission, as: 'permissions' }
    });
    res.json({ message: 'update role by id', data: updated });
  } catch (err) {
    next(err);
  }
}

// destroy
async function destroy(req, res, next) {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    await role.destroy();
    res.json({ message: 'delete role by id', data: role });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, find, update, destroy };