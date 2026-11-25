const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customers');
const authorize = require('../middlewares/authorize');

router.get('/', authorize('customers', 'read', 'any'), customersController.list);
router.get('/:id', authorize('customers', 'read', 'any'), customersController.find);
router.post('/', authorize('customers', 'create', 'any'), customersController.create);
router.put('/:id', authorize('customers', 'update', 'any'), customersController.update);
router.delete('/:id', authorize('customers', 'delete', 'any'), customersController.destroy);

module.exports = router;