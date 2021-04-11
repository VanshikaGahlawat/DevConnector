const jwt= require("jsonwebtoken");
const config= require("config");

module.exports = function (req,res,next){

    // get token from header
    const token= req.header('x-auth-token');

    //if token not available
    if(!token){
        return res.status(401).json({msg:"No token, access denied."});
    }

    //verify token
    try{
        const decoded= jwt.verify(token, config.get('JwtSecret'));
        req.user= decoded.user;
        next();
        
    } catch(err){
        return res.status(401).json({msg:"token dosent match"});
    }
}