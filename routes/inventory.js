const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory');
//app llama a router y este a controller

/* GET users listing. */
router.get('/', inventoryController.list);
//Get user by id
router.get('/:id', inventoryController.find);
//POST create user
router.post('/', inventoryController.create);
//PUT update by id
router.put('/:id', inventoryController.update);
//delete by id 
router.delete('/:id', inventoryController.destroy);

module.exports = router;