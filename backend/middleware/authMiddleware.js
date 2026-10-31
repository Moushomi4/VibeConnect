const jwt= require('jsonwebtoken');

const authMiddleware=(req,res,next)=>{
    const authToken= req.cookies?.auth_token;

    if(!authToken){
        return response(res,404,'authorization token missing. please provide tokens')
    }
    try{
        const decode= jwt.verify(authToken, process.env.JWT_SECRET);
        req.user= decode;
        // console.log(req.user);
        next();
    }catch(e){
        console.error(e);
        return response(res,404,'Invalid or expired token')
    }
}

module.exports= authMiddleware;