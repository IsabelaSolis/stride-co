const mongoose = require('mongoose');
const { Customer } = require('../models/documents');
const { pick } = require('../utils/http');

const FIELDS = ['userId', 'phone', 'email', 'addresses'];

// create
async function create(req, res, next) {
  try {
    const customer = await Customer.create(pick(req.body, FIELDS));
    res.status(201).json({ message: req.__('customers.created'), data: customer });
  } catch (err) {
    next(err);
  }
}

// list
async function list(req, res, next) {
  try {
    const customers = await Customer.find().sort({ createdAt: 1 });
    res.json({ message: req.__('customers.list'), data: customers });
  } catch (err) {
    next(err);
  }
}

// find by id
async function find(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: req.__('common.invalidId') });
    }
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: req.__('customers.notFound') });
    res.json({ message: req.__('customers.found'), data: customer });
  } catch (err) {
    next(err);
  }
}

// update
async function update(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: req.__('common.invalidId') });
    }
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: req.__('customers.notFound') });

    customer.set(pick(req.body, FIELDS));
    await customer.save(); // save() ejecuta las validaciones del esquema
    res.json({ message: req.__('customers.updated'), data: customer });
  } catch (err) {
    next(err);
  }
}

// destroy
async function destroy(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: req.__('common.invalidId') });
    }
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: req.__('customers.notFound') });
    res.json({ message: req.__('customers.deleted'), data: { id: customer._id } });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, find, update, destroy };