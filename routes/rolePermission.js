const express = require('express');
const router = express.Router();
const rolePermissionController = require('../controllers/rolePermission');
//app llama a router y este a controller
//aqui no vamos a detern update, porque no tiene sentido por que ambas columnas
//son PK
/* GET users listing. */
router.get('/', rolePermissionController.list);
//Get user by id
router.get('/:roleId', rolePermissionController.find);
//POST create user
router.post('/', rolePermissionController.create);
//delete by id 
router.delete('/:roleId/:permissionId', rolePermissionController.destroy);

module.exports = router;