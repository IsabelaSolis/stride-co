const express = require('express');
const router = express.Router();
const authorize = require('../../middlewares/authorize');
const products = require('../../controllers/web/adminProducts');

// F8: administracion de productos (permisos products:*:any)
router.get('/products', authorize('products', 'read', 'any'), products.list);
router.get('/products/new', authorize('products', 'create', 'any'), products.newForm);
router.post('/products', authorize('products', 'create', 'any'), products.create);
router.get('/products/:id/edit', authorize('products', 'update', 'any'), products.editForm);
router.post('/products/:id', authorize('products', 'update', 'any'), products.update);
router.post('/products/:id/delete', authorize('products', 'delete', 'any'), products.destroy);

module.exports = router;