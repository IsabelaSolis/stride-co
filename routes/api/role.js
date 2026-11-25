const express = require('express');
const router = express.Router();
<<<<<<< HEAD:routes/api/role.js
const roleController = require('../../controllers/role');
//app llama a router y este a controller
=======
const roleController = require('../controllers/role');
const authorize = require('../middlewares/authorize');
>>>>>>> origin/staging:routes/role.js

router.get('/', authorize('roles', 'read', 'any'), roleController.list);
router.get('/:id', authorize('roles', 'read', 'any'), roleController.find);
router.post('/', authorize('roles', 'create', 'any'), roleController.create);
router.put('/:id', authorize('roles', 'update', 'any'), roleController.update);
router.delete('/:id', authorize('roles', 'delete', 'any'), roleController.destroy);

module.exports = router;