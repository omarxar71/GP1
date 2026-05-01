import User from "../../database/User/user.model.js";
import { generateToken } from "../../utils/token/token.js";
import { hashing, compareHash } from "../../utils/hashing/hashing.js";
import sendEmail from '../../utils/sendEmail/nodemailer.js';
import { generateHTMLFormEmail } from '../../utils/generateHTML/generateHTML.js';
import Randomstring from 'randomstring';
import OTP from '../../database/OTP/otp.model.js';
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
    }catch(error){
        return res.status(500).json({message : "internal server error" , error:error.message})
        
    }
}
export const signUp = async(req,res,next)=>{
    const{email , password  , firstName , LastName , PhoneNumber }=req.body;
    try{
        const checkIfUserSigned = await User.findOne({email})
        if(checkIfUserSigned){
            return res.status(409).json({message : "user already exists"})
        }
        
        const creatuser = await User.create({
            email , password:hashing({plainText:password})  , firstName , LastName , PhoneNumber ,  status:"Available"})
        const otp = Randomstring.generate({length:5 , charset:'numeric'})
        const saveOTPInDB = await OTP.create({email , otp})
        const isSent = await sendEmail({to : email , subject:"Welcome to HireBridge" , html:generateHTMLFormEmail({otp , name:firstName})})
       
        return res.status(201).json({message : "user created successfully" , user:creatuser})
    }catch(error){
        return res.status(500).json({message : "internal server error" , error:error.message})

    }
}
export const verifyOTPofPersonalEmail = async(req,res,next)=>{
    try {
        const {email ,otp}=req.body
        const getOTPByEmail = await OTP.findOne({email})
        if(!getOTPByEmail)
            return res.status(404).json({message : "OTP not found"})
        if(getOTPByEmail.otp !== otp)
            return res.status(400).json({message : "OTP is incorrect"})
        const verifyUser = await User.findOneAndUpdate({email} , {isVerified:true} , {new:true})
        if(!verifyUser)
            return res.status(404).json({message : "user not found"})
        const generateTokenByEmail = generateToken({plainText:{id:verifyUser.id , email:verifyUser.email}})
        return res.status(200).json({message : "OTP verified successfully" , token:generateTokenByEmail})
        

    } catch (error) {
        return res.status(500).json({message : "internal server error" , error:error.message})
        
    }
}