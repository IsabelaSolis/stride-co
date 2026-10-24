const mongoose = require('mongoose');
const { Order } = require('../models/documents');

async function orderOwnerId(req) {
  if (!mongoose.isValidObjectId(req.params.id)) return null;
  const order = await Order.findById(req.params.id, 'salesPersonId');
  return order ? order.salesPersonId : null;
}

module.exports = { orderOwnerId };