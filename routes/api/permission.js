const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permission');
const authorize = require('../middlewares/authorize');

router.get('/', authorize('permissions', 'read', 'any'), permissionController.list);
router.get('/:id', authorize('permissions', 'read', 'any'), permissionController.find);
router.post('/', authorize('permissions', 'create', 'any'), permissionController.create);
router.put('/:id', authorize('permissions', 'update', 'any'), permissionController.update);
router.delete('/:id', authorize('permissions', 'delete', 'any'), permissionController.destroy);

module.exports = router;