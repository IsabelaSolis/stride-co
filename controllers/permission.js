const { Permission } = require('../models/relationals');

// create
async function create(req, res, next) {
  try {
    const { key, description } = req.body;
    const permission = await Permission.create({ key, description });
    res.status(201).json({ message: 'create permission', data: permission });
  } catch (err) {
    next(err);
  }
}

// list
async function list(req, res, next) {
  try {
    const permissions = await Permission.findAll();
    res.json({ message: 'list of permission', data: permissions });
  } catch (err) {
    next(err);
  }
}

// find by id
async function find(req, res, next) {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) return res.status(404).json({ message: 'Permission not found' });
    res.json({ message: 'find a permission by id', data: permission });
  } catch (err) {
    next(err);
  }
}

// update
async function update(req, res, next) {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) return res.status(404).json({ message: 'Permission not found' });

    const { key, description } = req.body;
    await permission.update({
      key: key ?? permission.key,
      description: description ?? permission.description
    });

    res.json({ message: 'update permission by id', data: permission });
  } catch (err) {
    next(err);
  }
}

// destroy
async function destroy(req, res, next) {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) return res.status(404).json({ message: 'Permission not found' });
    await permission.destroy();
    res.json({ message: 'delete permission by id', data: permission });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, find, update, destroy };