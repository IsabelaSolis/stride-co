const { Permission } = require('../models/relationals');
const { parseId } = require('../utils/http');

// create
async function create(req, res, next) {
  try {
    const { key, description } = req.body;
    const permission = await Permission.create({ key, description });
    res.status(201).json({ message: req.__('permissions.created'), data: permission });
  } catch (err) {
    next(err);
  }
}

// list
async function list(req, res, next) {
  try {
    const permissions = await Permission.findAll({ order: [['id', 'ASC']] });
    res.json({ message: req.__('permissions.list'), data: permissions });
  } catch (err) {
    next(err);
  }
}

// find by id
async function find(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const permission = await Permission.findByPk(id);
    if (!permission) return res.status(404).json({ message: req.__('permissions.notFound') });
    res.json({ message: req.__('permissions.found'), data: permission });
  } catch (err) {
    next(err);
  }
}

// update
async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const permission = await Permission.findByPk(id);
    if (!permission) return res.status(404).json({ message: req.__('permissions.notFound') });

    const { key, description } = req.body;
    await permission.update({
      key: key ?? permission.key,
      description: description ?? permission.description
    });

    res.json({ message: req.__('permissions.updated'), data: permission });
  } catch (err) {
    next(err);
  }
}

// destroy
async function destroy(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const permission = await Permission.findByPk(id);
    if (!permission) return res.status(404).json({ message: req.__('permissions.notFound') });
    await permission.destroy();
    res.json({ message: req.__('permissions.deleted'), data: permission });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, find, update, destroy };