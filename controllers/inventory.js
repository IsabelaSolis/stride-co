const { Inventory, ProductVariant } = require('../models/relationals');
const { parseId, pick } = require('../utils/http');

const FIELDS = ['stock', 'reserved', 'variant_id'];
const relations = [
  { model: ProductVariant, as: 'variant' }
];

//create
async function create(req, res, next) {
  try {
    const record = await Inventory.create(pick(req.body, FIELDS));
    const created = await Inventory.findByPk(record.id, { include: relations });
    res.status(201).json({ message: req.__('inventory.created'), data: created });
  } catch (err) {
    next(err);
  }
}

//find
async function list(req, res, next) {
  try {
    const records = await Inventory.findAll({ include: relations, order: [['id', 'ASC']] });
    res.json({ message: req.__('inventory.list'), data: records });
  } catch (err) {
    next(err);
  }
}

//find by id
async function find(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const record = await Inventory.findByPk(id, { include: relations });
    if (!record) return res.status(404).json({ message: req.__('inventory.notFound') });

    res.json({ message: req.__('inventory.found'), data: record });
  } catch (err) {
    next(err);
  }
}

//update
async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const record = await Inventory.findByPk(id);
    if (!record) return res.status(404).json({ message: req.__('inventory.notFound') });

    await record.update(pick(req.body, FIELDS));
    const updated = await Inventory.findByPk(id, { include: relations });
    res.json({ message: req.__('inventory.updated'), data: updated });
  } catch (err) {
    next(err);
  }
}

//destroy
async function destroy(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const record = await Inventory.findByPk(id);
    if (!record) return res.status(404).json({ message: req.__('inventory.notFound') });

    await record.destroy();
    res.json({ message: req.__('inventory.deleted'), data: record });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, find, update, destroy };