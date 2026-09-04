const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders');
//app llama a router y este a controller

/* GET users listing. */
router.get('/', ordersController.list);
//Get user by id
router.get('/:id', ordersController.find);
//POST create user
router.post('/', ordersController.create);
//PUT update by id
router.put('/:id', ordersController.update);
//delete by id 
router.delete('/:id', ordersController.destroy);

module.exports = router;