const { User } = require('../models/relationals');

// Llena req.user a partir del token con el express-jwt ya puso req.auth.sub
async function loadUser(req, res, next) {
  try {
    const user = await User.findByPk(req.auth.sub);
    if (!user || !user.active) return res.status(401).json({ message: 'Unauthorize' });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = [loadUser];