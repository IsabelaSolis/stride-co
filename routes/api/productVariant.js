const express = require('express');
const router = express.Router();
const productVariantController = require('../controllers/productVariant');
const authorize = require('../middlewares/authorize');

router.get('/', authorize('variants', 'read', 'any'), productVariantController.list);
router.get('/:id', authorize('variants', 'read', 'any'), productVariantController.find);
router.post('/', authorize('variants', 'create', 'any'), productVariantController.create);
router.put('/:id', authorize('variants', 'update', 'any'), productVariantController.update);
router.delete('/:id', authorize('variants', 'delete', 'any'), productVariantController.destroy);

module.exports = router;