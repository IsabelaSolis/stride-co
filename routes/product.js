const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
//app llama a router y este a controller

/* GET users listing. */
router.get('/', productController.list);
//Get user by id
router.get('/:id', productController.find);
//POST create user
router.post('/', productController.create);
//PUT update by id
router.put('/:id', productController.update);
//delete by id 
router.delete('/:id', productController.destroy);

module.exports = router;