import User from '../database/User/user.model.js';
import {verifyToken} from '../utils/token/token.js'; 
export const authenticationMiddleware = async(req ,res, next)=>{
    try{
        const {auth}= req.headers;
        if(!auth){
            return res.status(401).json({message:"token is missing"});
        }
        const payload = verifyToken({token:auth , secretKey:process.env.TokenSecretekey})
        
        const user = await User.findOne({_id:payload.id}).select('-password');
        
        if(!user){
            return res.status(401).json({message:"invalid token or user not found"});
        }
        req.user=user;
        next();
    }catch (err){
        return res.status(500).json({message:"internal server error"});
    }
}