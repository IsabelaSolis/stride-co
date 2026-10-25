const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const authorize = require('../middlewares/authorize');

router.get('/', authorize('users', 'read', 'any'), usersController.list);
router.get('/:id', authorize('users', 'read', 'any'), usersController.find);
router.post('/', usersController.create);
router.put('/:id', usersController.update);
router.delete('/:id', usersController.destroy);

module.exports = router;