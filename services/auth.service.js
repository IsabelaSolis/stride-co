const jwt = require('jsonwebtoken');
const config = require('config');
const { User } = require('../models/relationals');
const { verifyPassword } = require('../utils/password');

// Servicio compartido por la API (controllers/auth.js) y las vistas web (controllers/web/auth.js)

function signToken(user) {
  const jwtOptions = {
    expiresIn: config.get('jwt.expiresIn'),
    issuer: config.get('jwt.issuer'),
    audience: config.get('jwt.audience'),
    algorithm: config.get('jwt.algorithm')
  };
  return jwt.sign({ sub: String(user.id) }, config.get('jwt.secret'), jwtOptions);
}

// Lanza un error si el token es invalido o esta vencido
function verifyToken(token) {
  return jwt.verify(token, config.get('jwt.secret'), {
    algorithms: [config.get('jwt.algorithm')],
    issuer: config.get('jwt.issuer'),
    audience: config.get('jwt.audience')
  });
}

// Regresa el usuario si las credenciales son correctas y esta activo; si no, null
async function authenticate(email, password) {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.active) return null;
  const valid = await verifyPassword(password, user.password);
  return valid ? user : null;
}

async function findActiveUser(id) {
  const user = await User.findByPk(id);
  return user && user.active ? user : null;
}

module.exports = { signToken, verifyToken, authenticate, findActiveUser };