const { Order } = require('../models/documents');

// create
async function create(req, res) {
  const order = await Order.create(req.body);
  res.status(201).json({ message: 'Order created', data: order });
}

// list
async function list(req, res) {
  const orders = await Order.find().populate('customerId');
  res.json({ message: 'GET orders', data: orders });
}

// find by id
async function find(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ message: 'GET order by id', data: order });
}

// update
async function update(req, res) {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ message: 'Order updated', data: order });
}

// destroy
async function destroy(req, res) {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ message: 'Order deleted', data: { id: order._id } });
}

module.exports = { create, list, find, update, destroy };
