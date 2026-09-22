function healthCheck(req, res, next){
  res.json({status: "UP"});
};

module.exports={healthCheck};