const { ProductVariant, Product, Inventory } = require('../models/relationals');
const { parseId, pick } = require('../utils/http');

const FIELDS = ['sku', 'size', 'color', 'active', 'product_id'];
const relations = [
  { model: Product, as: 'product' },
  { model: Inventory, as: 'inventory' }
];

//create
async function create(req, res, next) {
  try {
    const record = await ProductVariant.create(pick(req.body, FIELDS));
    const created = await ProductVariant.findByPk(record.id, { include: relations });
    res.status(201).json({ message: req.__('variants.created'), data: created });
  } catch (err) {
    next(err);
  }
}

//find
async function list(req, res, next) {
  try {
    const records = await ProductVariant.findAll({ include: relations, order: [['id', 'ASC']] });
    res.json({ message: req.__('variants.list'), data: records });
  } catch (err) {
    next(err);
  }
}

//find by id
async function find(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const record = await ProductVariant.findByPk(id, { include: relations });
    if (!record) return res.status(404).json({ message: req.__('variants.notFound') });

    res.json({ message: req.__('variants.found'), data: record });
  } catch (err) {
    next(err);
  }
}

//update
async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const record = await ProductVariant.findByPk(id);
    if (!record) return res.status(404).json({ message: req.__('variants.notFound') });

    await record.update(pick(req.body, FIELDS));
    const updated = await ProductVariant.findByPk(id, { include: relations });
    res.json({ message: req.__('variants.updated'), data: updated });
  } catch (err) {
    next(err);
  }
}

//destroy
async function destroy(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const record = await ProductVariant.findByPk(id);
    if (!record) return res.status(404).json({ message: req.__('variants.notFound') });

    await record.destroy();
    res.json({ message: req.__('variants.deleted'), data: record });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, find, update, destroy };