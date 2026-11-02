const { User } = require('../models/relationals');

// Llena req.user a partir del token (express-jwt ya puso req.auth.sub)
async function loadUser(req, res, next) {
  try {
    const user = await User.findByPk(req.auth.sub);
    if (!user || !user.active) {
      return res.status(401).json({ message: req.__('common.unauthorized') });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = [loadUser];