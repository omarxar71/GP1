import { Company } from "../../database/company/company.model.js"
import User from "../../database/User/user.model.js"
import { generateHTMLFormEmail } from "../../utils/generateHTML/generateHTML.js"
import sendEmail from "../../utils/sendEmail/nodemailer.js"
import Randomstring from "randomstring"
import { verifyToken } from "../../utils/token/token.js"
import { Job } from "../../database/job/job.model.js"
import { Interview } from "../../database/interview/interview.model.js"
import OTP from "../../database/OTP/otp.model.js"
export const CreateCompanyProfile = async (req, res, next) => {
    try {
        //so after signing-up then choosing that the user logged-in now is a company employer he has to fill both rest of his personal information and the rest of the company information
        const { name, CompanyEmail, industry, size, website, logo, preferredPricing, commissionRate, role, employerProfile: { EmployerCompanyName, companySize, budgetRange } } = req.body
        const existingCompany = await Company.findOne({ CompanyEmail })
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
        const user = await User.findByIdAndUpdate(req.user.id, {
            role, employerProfile: {
                EmployerCompanyName,
                companySize,
                industry,
                budgetRange,
                // hiringHistory
            }
        }, {
            new: true
        })

        const otp = Randomstring.generate({ length: 5, charset: 'numeric' })
        const saveOTP = await OTP.create({ email: CompanyEmail, otp })
        const isSent = await sendEmail({ to: CompanyEmail, subject: "Welcome to HireBridge company side", html: generateHTMLFormEmail({ name: name, otp }) })
        return res.status(201).json({ message: "company created successfully and otp is sent", NewCompany: CreateCompany, user })

    } catch (error) {
        return res.status(500).json({ message: `internal server error from company profile${error.message}`, error: error })
    }

}
//verify the company email entered by the user that is supposed to be the admin 
export const verifyCompanyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body
        const findOTPByEmail = await OTP.findOne({ email })
        if (!findOTPByEmail)
            return res.status(404).json({ message: "OTP not found" })
        if (findOTPByEmail.otp !== otp)
            return res.status(400).json({ message: "OTP is incorrect" })
        const company = await Company.findOneAndUpdate({ CompanyEmail: email }, { isVerified: true }, { new: true })
        const admin = {
            adminEmail: req.user.email, // Usually it's req.user.email
            id: req.user.id
        }
        company.admin = admin
        await company.save()
        return res.status(200).json({ message: "company email verified successfully", company })
    } catch (error) {
        return res.status(500).json({ message: "internal server error", error: error.message })

    }
}

export const getCompanyProfile = async (req, res, next) => {
    try {
        const { companyId } = req.params
        const company = await Company.findById(companyId).select("-password")
        if (!company)
            return res.status(404).json({ message: "company not found" })
        const isAdmin = company.admin?.adminEmail === req.user.email;
        const employerExist = company.employees.find((emp) => {
            return emp.user.id == req.user.id && emp.status == "approved"
        })
        if (!employerExist && !isAdmin)
            return res.status(403).json({ message: "you are not authorized to view this company profile" })
        return res.status(200).json({ message: "company profile", company })
    } catch (error) {
        return res.status(500).json({ message: "internal server error", error: error.message })
    }
}
//get all the jobs posted by a specific company only system can see this lists 
export const getJobsOfSpecificCompany = async (req, res, next) => {
    try {
        const { companyId } = req.params
        const company = await Company.findById(companyId)
        const findJobs = await Job.find({ company: companyId })

        if (!company)
            return res.status(404).json({ message: "company not found" })
        const searchEmployee = company.employees.find((emp) => {
            if (emp.user.toJSON() == req.user.id.toJSON() && emp.status == "approved") {
                return emp
            }

        })
        if (searchEmployee || company.admin.adminEmail === req.user.email || req.user.role === "systemAdmin")
            return res.status(200).json({ message: "all jobs", jobs: findJobs })

        return res.status(403).json({ message: "you are not authorized to see the jobs of this company" })

    } catch (error) {
        return res.status(500).json({ message: "server error", error: error.message })
    }
}

export const getCompanyInterviews = async (req, res, next) => {
    try {
        const { companyId } = req.params
        const company = await Company.findById(companyId)
        if (!company)
            return res.status(404).json({ message: "company not found" })

        // check if the user is the company admin
        const isAdmin = company.admin?.adminEmail === req.user.email

        // check if the user is a system admin or super admin
        const isSysAdmin = req.user.role === "superAdmin" || req.user.role === "systemAdmin"

        // check if the user is an approved employee
        const isEmployee = company.employees.find((emp) => {
            return emp.user.toString() === req.user.id && emp.status === "approved"
        })
        if (!isAdmin && !isEmployee && !isSysAdmin)
            return res.status(403).json({ message: "you are not authorized to view this company's interviews" })
        const interviews = await Interview.find({ company: companyId })
            .populate("candidate")
            .populate("job")
            .populate("scheduledBy")
        if (!interviews || interviews.length === 0)
            return res.status(200).json({ message: "no interviews found", interviews: [] })

        return res.status(200).json({ message: "interviews found", total: interviews.length, interviews })
    } catch (error) {
        return res.status(500).json({ message: "internal server error", error: error.message })
    }
}

export const updateInterviewStatus = async (req, res, next) => {
    try {
        const { interviewId } = req.params
        const { status, outcome, notes } = req.body

        const interview = await Interview.findById(interviewId)
        if (!interview)
            return res.status(404).json({ message: "interview not found" })

        // get the company this interview belongs to
        const company = await Company.findById(interview.company)
        if (!company)
            return res.status(404).json({ message: "company not found" })

        // check authorization: company admin, approved employee, or system admin
        const isAdmin = company.admin?.adminEmail === req.user.email
        const isSysAdmin = req.user.role === "superAdmin" || req.user.role === "systemAdmin"
        const isEmployee = company.employees.find((emp) => {
            return emp.user.toString() === req.user.id && emp.status === "approved"
        })

        if (!isAdmin && !isEmployee && !isSysAdmin)
            return res.status(403).json({ message: "you are not authorized to update this interview" })

        // validate status value
        const validStatuses = ['scheduled', 'completed', 'cancelled', 'rescheduled']
        if (status && !validStatuses.includes(status))
            return res.status(400).json({ message: `invalid status. must be one of: ${validStatuses.join(', ')}` })

        // validate outcome value
        const validOutcomes = ['passed', 'failed', 'pending']
        if (outcome && !validOutcomes.includes(outcome))
            return res.status(400).json({ message: `invalid outcome. must be one of: ${validOutcomes.join(', ')}` })
        const user = await User.findById(interview.candidate)

        // update only the provided fields
        if (status) interview.status = status

        if (outcome) interview.outcome = outcome
        if (outcome == "passed") user.candidateProfile.status = "hired"
        if (notes) interview.notes = notes

        await interview.save()
        await user.save()

        return res.status(200).json({ message: "interview updated successfully", interview })
    } catch (error) {
        return res.status(500).json({ message: "internal server error", error: error.message })
    }
}

export const registerCompanyEmployee = async (req, res, next) => {
    try {
        const { companyId } = req.params
        const { email, password, firstName, lastName, phoneNumber } = req.body

        // get the company
        const company = await Company.findById(companyId)
        if (!company)
            return res.status(404).json({ message: "company not found" })

        // only the company admin can register employees
        if (company.admin?.adminEmail !== req.user.email)
            return res.status(403).json({ message: "only the company admin can register employees" })

        // check if a user with this email already exists
        const existingUser = await User.findOne({ email })
        if (existingUser)
            return res.status(400).json({ message: "user with this email already exists" })

        // create the new user with employer role
        const hashedPassword = hashing({ plainText: password })
        const newUser = await User.create({
            email,
            password: hashedPassword,
            role: "CompanyEmployer",
            isVerified: true,
            firstName,
            lastName,
            phoneNumber,
            employerProfile: {
                EmployerCompanyName: company.name,
                companySize: company.size,
                industry: company.industry,
            }
        })

        // add them directly as an approved employee in the company
        company.employees.push({
            user: newUser._id,
            status: "approved",
            joinedAt: Date.now()
        })
        await company.save()

        return res.status(201).json({
            message: "employee registered and added to company successfully",
            user: newUser
        })
    } catch (error) {
        return res.status(500).json({ message: "internal server error", error: error.message })
    }
}










