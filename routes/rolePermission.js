const express = require('express');
const router = express.Router();
const rolePermissionController = require('../controllers/rolePermission');
const authorize = require('../middlewares/authorize');

router.get('/', authorize('rolePermissions', 'read', 'any'), rolePermissionController.list);
router.get('/:roleId', authorize('rolePermissions', 'read', 'any'), rolePermissionController.find);
router.post('/', authorize('rolePermissions', 'create', 'any'), rolePermissionController.create);
router.delete('/:roleId/:permissionId', authorize('rolePermissions', 'delete', 'any'), rolePermissionController.destroy);

module.exports = router;