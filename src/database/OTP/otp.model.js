
import { model, Schema } from "mongoose";

const otpSchema = new Schema({
email : {type : String , required : true} , 
otp :{type : String ,required : true},
},{timestamps: true});
const OTP = model("OTP" , otpSchema)
export default OTP;