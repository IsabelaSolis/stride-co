const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory');
const authorize = require('../middlewares/authorize');

router.get('/', authorize('inventory', 'read', 'any'), inventoryController.list);
router.get('/:id', authorize('inventory', 'read', 'any'), inventoryController.find);
router.post('/', authorize('inventory', 'create', 'any'), inventoryController.create);
router.put('/:id', authorize('inventory', 'update', 'any'), inventoryController.update);
router.delete('/:id', authorize('inventory', 'delete', 'any'), inventoryController.destroy);

module.exports = router;