const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role');
//app llama a router y este a controller

/* GET users listing. */
router.get('/', roleController.list);
//Get user by id
router.get('/:id', roleController.find);
//POST create user
router.post('/', roleController.create);
//PUT update by id
router.put('/:id', roleController.update);
//delete by id 
router.delete('/:id', roleController.destroy);

module.exports = router;