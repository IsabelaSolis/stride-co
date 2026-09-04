const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permission');
//app llama a router y este a controller

/* GET users listing. */
router.get('/', permissionController.list);
//Get user by id
router.get('/:id', permissionController.find);
//POST create user
router.post('/', permissionController.create);
//PUT update by id
router.put('/:id', permissionController.update);
//delete by id 
router.delete('/:id', permissionController.destroy);

module.exports = router;