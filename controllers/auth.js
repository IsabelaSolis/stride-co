const { User, Role } = require('../models/relationals');
const authService = require('../services/auth.service');
const config = require('config');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return res.status(400).json({ message: req.__('common.validationError') });
    }

    const user = await authService.authenticate(email, password);
    if (!user) return res.status(401).json({ message: req.__('auth.invalidCredentials') });

    res.json({
      message: req.__('auth.loginSuccess'),
      data: {
        token: authService.signToken(user),
        token_type: 'Bearer',
        expires_in: config.get('jwt.expiresIn')
      }
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, { include: [{ model: Role, as: 'role' }] });
    res.json({ message: req.__('auth.me'), data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me };