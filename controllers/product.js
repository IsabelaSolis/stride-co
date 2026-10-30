const { Product, Category, ProductVariant, Inventory } = require('../models/relationals');
const { parseId, pick } = require('../utils/http');

const FIELDS = ['name', 'description', 'brand', 'price', 'active', 'category_id'];
const relations = [
  { model: Category, as: 'category' },
  { model: ProductVariant, as: 'variants', include: [{ model: Inventory, as: 'inventory' }] }
];

//create
async function create(req, res, next) {
  try {
    const record = await Product.create(pick(req.body, FIELDS));
    const created = await Product.findByPk(record.id, { include: relations });
    res.status(201).json({ message: req.__('products.created'), data: created });
  } catch (err) {
    next(err);
  }
}

//find
async function list(req, res, next) {
  try {
    const records = await Product.findAll({ include: relations, order: [['id', 'ASC']] });
    res.json({ message: req.__('products.list'), data: records });
  } catch (err) {
    next(err);
  }
}

//find by id
async function find(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const record = await Product.findByPk(id, { include: relations });
    if (!record) return res.status(404).json({ message: req.__('products.notFound') });

    res.json({ message: req.__('products.found'), data: record });
  } catch (err) {
    next(err);
  }
}

//update
async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const record = await Product.findByPk(id);
    if (!record) return res.status(404).json({ message: req.__('products.notFound') });

    await record.update(pick(req.body, FIELDS));
    const updated = await Product.findByPk(id, { include: relations });
    res.json({ message: req.__('products.updated'), data: updated });
  } catch (err) {
    next(err);
  }
}

//destroy
async function destroy(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ message: req.__('common.invalidId') });

    const record = await Product.findByPk(id);
    if (!record) return res.status(404).json({ message: req.__('products.notFound') });

    await record.destroy();
    res.json({ message: req.__('products.deleted'), data: record });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, find, update, destroy };