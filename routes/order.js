const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders');
const authorize = require('../middlewares/authorize');
const { orderOwnerId } = require('../middlewares/ownership');

router.get('/', authorize('orders', 'read', 'any'), ordersController.list);
router.get('/:id', authorize('orders', 'read', 'own', orderOwnerId), ordersController.find);
router.post('/', authorize('orders', 'create', 'any'), ordersController.create);
router.put('/:id', authorize('orders', 'update', 'own', orderOwnerId), ordersController.update);
router.delete('/:id', ordersController.destroy);

module.exports = router;