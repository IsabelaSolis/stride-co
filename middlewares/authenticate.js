const {express-jwt}=require ('express-jwt');
const {User}=require('../models/relationals');



async function loadUser(req,res,next){
    const user =await User.findByPk(req.auth.sub);
    if(!user || !user.active ) return res.status(401).json({message: "Unauthorize"});
    req.user=user;
    next();//cuando se llama una funcion de determinacion se acaba el response, pero el middleware sigue
}

const authenticate=[loadUser];

module.exports=authenticate;