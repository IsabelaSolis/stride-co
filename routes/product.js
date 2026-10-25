const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const authorize = require('../middlewares/authorize');

router.get('/', authorize('products', 'read', 'any'), productController.list);
router.get('/:id', authorize('products', 'read', 'any'), productController.find);
router.post('/', authorize('products', 'create', 'any'), productController.create);
router.put('/:id', authorize('products', 'update', 'any'), productController.update);
router.delete('/:id', authorize('products', 'delete', 'any'), productController.destroy);

module.exports = router;