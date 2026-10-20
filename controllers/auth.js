const { User } = require('../models/relationals');
const { verifyPassword } = require('../utils/password');
const jwt=require('jsonwebtoken');


function signToken(user){//recibe un usuario para poder ingresar los datos que necesitamos
  const jwtUser={//elementos que queremos firmar en el jwt
    expiresIn:"15m",//TIEMPO DE EXPIRACION QUE TIENE EL JWT
    issuer:"stride-co",
    audience:"stride-co-api",
    algorithm: "HS256"
  };
  const secret="4524ae5b264e28b9a409c98a3b4314a1";

  //lleva 1 objeto y adentro 3 cosas: 
  return jwt.sign({sub: String(user.id)}, secret, jwtUser);
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !user.active) return res.status(401).json({message: req.__('auth.invalidCredentials')});

    const valid = await verifyPassword(password, user.password);
    if (!valid) return res.status(401).json({message: req.__('auth.invalidCredentials')});

    res.json({
      message: 'Login successful',
      data: {
        token: signToken(user),
        toke_type:"Bearer",
        expires_in:"15m"
      }
    });
  } catch (err) {
    next(err);
  }
}
module.exports = { login };