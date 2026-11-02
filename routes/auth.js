const express = require('express');
const { expressjwt } = require('express-jwt');
const config = require('config');
const router = express.Router();

const controller = require('../controllers/auth');
const authenticate = require('../middlewares/authenticate');

const jwtCheck = expressjwt({
  secret: config.get('jwt.secret'),
  algorithms: [config.get('jwt.algorithm')]
});

router.post('/login', controller.login);
router.get('/me', jwtCheck, authenticate, controller.me);

module.exports = router;