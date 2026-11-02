const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const authorize = require('../middlewares/authorize');

router.get('/', authorize('users', 'read', 'any'), usersController.list);
router.get('/:id', authorize('users', 'read', 'any'), usersController.find);
router.post('/', authorize('users', 'create', 'any'), usersController.create);
router.put('/:id', authorize('users', 'update', 'any'), usersController.update);
router.delete('/:id', authorize('users', 'delete', 'any'), usersController.destroy);

module.exports = router;