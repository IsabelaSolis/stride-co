const express = require('express');
const router = express.Router();
const productVariantController = require('../controllers/productVariant');
//app llama a router y este a controller

/* GET users listing. */
router.get('/', productVariantController.list);
//Get user by id
router.get('/:id', productVariantController.find);
//POST create user
router.post('/', productVariantController.create);
//PUT update by id
router.put('/:id', productVariantController.update);
//delete by id 
router.delete('/:id', productVariantController.destroy);

module.exports = router;