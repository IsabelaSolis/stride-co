const mongoose = require('mongoose');
const { Order, Customer } = require('../models/documents');
const { pick } = require('../utils/http');

// salesPersonId y statusHistory los define el servidor, no el cliente
const FIELDS = ['customerId', 'paymentMethod', 'totals', 'shippingAddress', 'items'];

// Revisa que customerId sea un id valido y que el cliente exista (relacion Order -> Customer)
async function checkCustomer(req, res, customerId) {
  if (!mongoose.isValidObjectId(customerId)) {
    res.status(400).json({ message: req.__('common.invalidId') });
    return false;
  }
  if (!(await Customer.exists({ _id: customerId }))) {
    res.status(400).json({ message: req.__('common.invalidReference') });
    return false;
  }
  return true;
}

// create
async function create(req, res, next) {
  try {
    const data = pick(req.body, FIELDS);
    if (data.customerId !== undefined && !(await checkCustomer(req, res, data.customerId))) return;

    const order = await Order.create({
      ...data,
      salesPersonId: req.user.id,
      statusHistory: [{ status: 'PENDING', changedById: req.user.id }]
    });
    const created = await Order.findById(order._id).populate('customerId');
    res.status(201).json({ message: req.__('orders.created'), data: created });
  } catch (err) {
    next(err);
  }
}

// list
async function list(req, res, next) {
  try {
    const orders = await Order.find({}, null, { sort: { createdAt: 1 } }).populate('customerId');
    res.json({ message: req.__('orders.list'), data: orders });
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
    const order = await Order.findById(req.params.id).populate('customerId');
    if (!order) return res.status(404).json({ message: req.__('orders.notFound') });
    res.json({ message: req.__('orders.found'), data: order });
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
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: req.__('orders.notFound') });

    const data = pick(req.body, FIELDS);
    if (data.customerId !== undefined && !(await checkCustomer(req, res, data.customerId))) return;

    order.set(data);
    // un cambio de estado se agrega al historial con el usuario autenticado
    if (req.body.status) {
      order.statusHistory.push({ status: req.body.status, changedById: req.user.id, note: req.body.note });
    }
    await order.save(); // save() ejecuta las validaciones del esquema

    const updated = await Order.findById(order._id).populate('customerId');
    res.json({ message: req.__('orders.updated'), data: updated });
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
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: req.__('orders.notFound') });
    res.json({ message: req.__('orders.deleted'), data: { id: order._id } });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, find, update, destroy };
