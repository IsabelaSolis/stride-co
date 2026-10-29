const { User } = require('../models/relationals');
const { verifyPassword } = require('../utils/password');
const jwt=require('jsonwebtoken');
const config = require('config');

//const INVALID_CREDENTIALS = { message: 'Invalid Credentials' };

function signToken(user){//recibe un usuario para poder ingresar los datos que necesitamos
  const jwtOptions={//elementos que queremos firmar en el jwt
    expiresIn: config.get('jwt.expiresIn'),//TIEMPO DE EXPIRACION QUE TIENE EL JWT
    issuer: config.get('jwt.issuer'),
    audience: config.get('jwt.audience'),
    algorithm: config.get('jwt.algorithm')
  };

  return jwt.sign({sub: String(user.id)}, config.get('jwt.secret'), jwtOptions);
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !user.active) return res.status(401).json({message: req.__('auth.invalidCredentials')});

    const valid = await verifyPassword(password, user.password);
    if (!valid) return res.status(401).json({message: req.__('auth.invalidCredentials')});

    res.json({
      message: "Login successful",
      data: {
        token: signToken(user),
        toke_type:"Bearer",
        expires_in: config.get('jwt.expiresIn')
      }
    });
  } catch (err) {
    next(err);
  }
}
module.exports = { login };