import { Company } from "../../database/company/company.model.js"
import User from "../../database/User/user.model.js"
import { generateHTMLFormEmail } from "../../utils/generateHTML/generateHTML.js"
import sendEmail from "../../utils/sendEmail/nodemailer.js"
import Randomstring from "randomstring"
import { verifyToken } from "../../utils/token/token.js"
import OTP from "../../database/OTP/otp.model.js"
export const CreateCompanyProfile = async(req ,res , next)=>{
try {
    //so after signing-up then choosing that the user logged-in now is a company employer he has to fill both rest of his personal information and the rest of the company information
    const {name, CompanyEmail, industry, size, website, logo, preferredPricing, commissionRate,role,employerProfile:{EmployerCompanyName,companySize,budgetRange} } = req.body
    const existingCompany = await Company.findOne({CompanyEmail})
    if (existingCompany) {
        return res.status(409).json({ message: "Company already exists" });
    }
    const CreateCompany = await Company.create({
        name,
        CompanyEmail,
        industry,
        size,
        website,
        logo,
        preferredPricing,
        commissionRate,
        // admin,
       
    })
    const user = await User.findByIdAndUpdate(req.user.id , {role,employerProfile:{
        EmployerCompanyName,
        companySize,
        industry,
        budgetRange,
        // hiringHistory
    }
    }, {
        new:true
    })
 
    const otp = Randomstring.generate({length:5 , charset:'numeric'})
    const saveOTP = await OTP.create({email:CompanyEmail , otp})
    const isSent= await sendEmail({to:CompanyEmail ,subject:"Welcome to HireBridge company side", html:generateHTMLFormEmail({name:name , otp})})
    return res.status(201).json({message  : "company created successfully and otp is sent" , NewCompany : CreateCompany , user})
   
}catch(error){
    return res.status(500).json({message : `internal server error from company profile${error.message}` , error:error})
}

}
//verify the company email entered by the user that is supposed to be the admin 
export const verifyCompanyEmail = async(req ,res , next)=>{
try {
    const {email , otp}= req.body
    const findOTPByEmail = await OTP.findOne({email})
    if(!findOTPByEmail)
        return res.status(404).json({message : "OTP not found"})
    if(findOTPByEmail.otp !== otp)
        return res.status(400).json({message : "OTP is incorrect"})
    const company = await Company.findOneAndUpdate({CompanyEmail:email} , {isVerified:true} , {new:true})
       const admin = {
        adminEmail: req.user.email, // Usually it's req.user.email
        id: req.user.id
    }
    company.admin = admin
    await company.save()
    return res.status(200).json({message : "company email verified successfully" , company})
} catch (error) {
    return res.status(500).json({message : "internal server error" , error:error.message})
    
}    
}




export const requestRegisterForCompany = async(req ,res , next)=>{
   //1-the employee will head to the company he wants to join and we will git the company id from the link
   //2-check if the user has a pending request or already an employee of this company
   //3-we will add the employee id to the company document in the pending request list
    try{
        const userId = req.user.id
        const{companyEmail}=req.body
        if(!companyEmail){
            return res.status(400).json({message : "company id is required"})

        }
        if(req.user.role !=="employer"){
            return res.status(404).json({message : "you are not an employer"})
        }
        const company = await Company.findOne({email:companyEmail})
        if(!company){
            return res.status(404).json({message : "company not found"})

        }
        // Check if user is already an employee or has a pending request
        const EmployeeExists = company.employees.find((emp)=>  emp.user==userId)
       if(EmployeeExists){
            if(EmployeeExists.status == "approved"){
                return res.status(400).json({message : "you are already an employee in this company"})
            }else if(EmployeeExists.status == "pending"){
                return res.status(400).json({message : "you already have a pending request to join this company"})
            }
       }
        company.employees.push({user:userId , status:"pending"})
        await company.save()
        return res.status(200).json({message:"requested"})
    }catch(error){
        return res.status(500).json({message : "internal server error" , error : error.message})
    }
}
export const getAllThePendingListForCompany = async(req , res , next)=>{
   try{
    const {companyId}= req.params
    const company = await Company.findById(companyId)
    if(!company || !companyId)
        return res.status(400).json({message : "no company found"})
    if(req.user.role !=="employer")
        return res.status(400).json({message : "you are not authorized"})
    return res.status(200).json({message : "all the pending users" , users:company.employees})
   }catch(error){
    return res.status(500).json({message : "internal server error" , error : error.message})

   }
}
export const acceptOrRejectEmp = async(req ,res , next)=>{
   try{
    const userId = req.user.id
    const {applicantId , action} = req.body
    const {companyId} = req.params
    const company = await Company.findById(companyId)
    const checkUserExistence =company.employees.find((user)=> user.id == userId)
    if(!checkUserExistence){
        return res.status(400).json({message : "this user does not exist in the pending list"})
    }
    if(req.user.role !== "employer")
        return res.status(400).json({message : "you are not authorized"})
    if(action =="approved"){
        company.employees.find((user)=>{
            if(user.id == applicantId){
                user.status ="approved"
                return res.status(200).json({message : "user approved"})
            }
            
        })
            await company.save()

    }
    if(action =="rejected"){
        company.employees.find((user)=>{
            if(user.id == applicantId){
                user.status ="rejected"
            }
        })
        await company.save()

    }
    return res.status(200).json({message :"user status", status:action})


   }catch(error){
    return res.status(500).json({message : "internal server error" , error : error.message})
    
   }
}