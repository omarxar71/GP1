import User from "../../database/User/user.model.js";
import { generateToken } from "../../utils/token/token.js";
import { hashing, compareHash } from "../../utils/hashing/hashing.js";
export const login=async(req,res,next)=>{
    const {email , password} = req.body;
    try{
        const findUser = await User.findOne({email})
        const saveUser ={
            email:findUser.email,
            role:findUser.role,
            id:findUser._id
        }
        if(!findUser ||!compareHash({plainText:password , hashedText:findUser.password})){
            return res.status(401).json({message : "user not found or passsword is incorrect"})
        }
        const token =generateToken({plainText:{id:findUser.id , email:findUser.email , role:findUser.role}})
        return res.status(200).json({message : 'login successfully' , user:saveUser , token})
    }catch(err){
        return res.status(500).json({message : "internal server error" , error:err.message})
        
    }
}
export const signUp = async(req,res,next)=>{
    const{email , password ,role , firstName , LastName , PhoneNumber  }=req.body;
    try{
        const checkIfUserSigned = await User.findOne({email})
        if(checkIfUserSigned){
            return res.status(409).json({message : "user already exists"})
        }
        
        const creatuser = await User.create({
            email , password:hashing({plainText:password}) ,role , firstName , LastName , PhoneNumber
        })
       
        return res.status(201).json({message : "user created successfully" , user:creatuser})
    }catch(err){
        return res.status(500).json({message : "internal server error" , error:err.message})

    }
}