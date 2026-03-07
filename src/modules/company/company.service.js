import { Company } from "../../database/company/company.model.js"

export const CreateCompanyProfile = async(req ,res , next)=>{
try {
    const {name, CompanyEmail, industry, size, website, logo, preferredPricing, commissionRate } = req.body
    const admin = {
        firstName: req.user.firstName || req.user.name, // Use fallback
        lastName: req.user.lastName || "",
        phone: req.user.phoneNumber || req.user.phone,
        adminEmail: req.user.email // Usually it's req.user.email
    }
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
        admin,
        employees: [req.user.id]
    })
    return res.status(201).json({message  : "company created successfully" , NewCompany : CreateCompany})
   
}catch(error){
    return res.status(500).json({message : "internal server error" , error:error.message})
}

}
export const requestRegisterForCompany = async(req ,res , next)=>{
    
}