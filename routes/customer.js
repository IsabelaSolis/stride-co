const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customers');
//app llama a router y este a controller

/* GET users listing. */
router.get('/', customersController.list);
//Get user by id
router.get('/:id', customersController.find);
//POST create user
router.post('/', customersController.create);
//PUT update by id
router.put('/:id', customersController.update);
//delete by id 
router.delete('/:id', customersController.destroy);

module.exports = router;