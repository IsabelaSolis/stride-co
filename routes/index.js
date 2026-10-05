var express = require('express');
var router = express.Router();
const controller = require('../controllers/index');

/* GET home page. */
router.get('/',(req, res, next) =>{
  res.render('index', { title: 'Express' });
});

router.get('/health', controller.healthCheck);

module.exports = router;
