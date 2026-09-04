const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
//app llama a router y este a controller

/* GET users listing. */
router.get('/', usersController.list);
//Get user by id
router.get('/:id', usersController.find);
//POST create user
router.post('/', usersController.create);
//PUT update by id
router.put('/:id', usersController.update);
//delete by id 
router.delete('/:id', usersController.destroy);

module.exports = router;
