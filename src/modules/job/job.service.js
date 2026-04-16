import User from "../../database/User/user.model.js"
import { Company } from '../../database/company/company.model.js';
import { Job } from '../../database/job/job.model.js';

//this api is called immediately after the employer login or register so the front-end can store the company id in the local storage to use to post jobs 
export const getMyCompany = async (req, res, next) => {
    try {
        const company = await Company.findOne({
            $or: [
                { "admin.adminEmail": req.user.email },
                { "employees.user": req.user.id }
            ]
        })
        if (!company)
            return res.status(404).json({ message: "no company found for this user" })

        return res.status(200).json({ company })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }
}


//employer post the job to the system
export const postJob = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { companyId } = req.params
        const { title, category, description, skillsRequired, experienceLevel, minExperience, budget, workType } = req.body

        const findCompany = await Company.findById(companyId)
        if (!findCompany)
            return res.status(404).json({ message: "company not found" })

        const isAdmin = findCompany.admin.adminEmail === req.user.email

        const isEmployee = findCompany.employees.find(emp =>
            emp.user.equals(userId) && emp.status === "approved"
        )

        if (!isAdmin && !isEmployee)
            return res.status(403).json({ message: "you are not authorized to post for this company" })

        const createJob = await Job.create({
            title, company: companyId, employerId: userId, category, description, skillsRequired, experienceLevel, minExperience, budget, workType
        })

        return res.status(200).json({ message: "job created successfully", job: createJob })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }
}
//delete job
export const deleteJob = async (req, res, next) => {
    try {
        const { jobId } = req.params

        const job = await Job.findById(jobId)
        if (!job)
            return res.status(404).json({ message: "job not found or already deleted" })

        const findCompany = await Company.findById(job.company)

        const isSystemAdmin = req.user.role === "systemAdmin"

        const isCompanyAdmin = findCompany.admin.adminEmail === req.user.email

        const isEmployee = findCompany.employees.find(emp =>
            emp.user.equals(req.user.id) && emp.status === "approved"
        )

        if (!isSystemAdmin && !isCompanyAdmin && !isEmployee)
            return res.status(403).json({ message: "you are not authorized to delete this job" })

        await job.deleteOne()
        return res.status(200).json({ message: "job deleted successfully" })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }
}
//get all the jobs posted by a specific company only system can see this lists 
export const getJobsOfSpecificCompany = async(req ,res , next)=>{
  try {
    const {companyId} = req.params
    const company = await Company.findById(companyId)
    const findJobs = await Job.find({company:companyId})

    if(!company)
        return res.status(404).json({message : "company not found"})
    const searchEmployee = company.employees.find((emp)=>{
        if(emp.user.toJSON() == req.user.id.toJSON() && emp.status == "approved"){
            return emp
        }

    })
    if(searchEmployee || company.admin.adminEmail === req.user.email || req.user.role === "systemAdmin")
        return res.status(200).json({message : "all jobs" , jobs:findJobs})

    return res.status(403).json({message : "you are not authorized to see the jobs of this company"})
   
  } catch (error) {
    return res.status(500).json({message : "server error" , error:error.message})
  }
}
//get all the job posted by all the companies 
export const getAllJobs = async(req ,res , next)=>{
   try {
    const allJobs = await Job.find()
    return res.status(200).json({message : "all jobs " , jobs:allJobs})
   } catch (error) {
    return res.status(500).json({message : "server error" , error : error.message})
   }
}

//get the shortlisted of the job
export const shortListedForCompany = async(req , res , next)=>{
   try {
    const {jobId} = req.params
    const EmployerId = req.user.id
    const job = await Job.findById(jobId).populate("shortlistedCandidates")
    if (!job)
        return res.status(435).json({message : "job not found"})
    const companyId = job.company
    const findCompany = await Company.findById(companyId)
    const searchEmployee = findCompany.employees.find((emp)=>{
        if(emp.user.toJSON() == req.user.id.toJSON() && emp.status == "approved"){
            return emp
        }

    })
    if(searchEmployee || findCompany.admin.adminEmail === req.user.email || req.user.role === "systemAdmin")
        return res.status(200).json({message : "all candidates for this job" , candidatesOfThisJob:job.shortlistedCandidates})

    return res.status(403).json({message : "you are not authorized to see the jobs of this company"})
   
    
   } catch (error) {
    return res.status(500).json({message : "server error" , error : error.message})
    
   }
}
//when open all candidates for the job the employer can accept or reject a candidate
//  so that the accepted candidates will go to the hiring page so that the employer schedule an interview with them
export const acceptCandidate = async (req, res, next) => {
    try {
        const { jobId, candidateId } = req.params

        const job = await Job.findById(jobId)
        if (!job)
            return res.status(404).json({ message: "job not found" })

        // make sure the candidate was actually sent to this job by the admin
        const isSent = job.shortlistedCandidates.find(item =>
            item.candidate.equals(candidateId)
        )
        if (!isSent)
            return res.status(404).json({ message: "this candidate was not sent to this job" })

        // make sure candidate is not already accepted
        const alreadyAccepted = job.acceptedCandidates.find(item =>
            item.candidate.equals(candidateId)
        )
        if (alreadyAccepted)
            return res.status(400).json({ message: "candidate already accepted" })

        // make sure the user is an admin or employee of this company
        const findCompany = await Company.findById(job.company)
        const isAdmin = findCompany.admin.adminEmail === req.user.email
        const isEmployee = findCompany.employees.find(emp =>
            emp.user.equals(req.user.id) && emp.status === "approved"
        )
        if (!isAdmin && !isEmployee)
            return res.status(403).json({ message: "you are not authorized" })

        // add to accepted and remove from rejected if they were rejected before
        job.acceptedCandidates.push({ candidate: candidateId })
        job.rejectedCandidates = job.rejectedCandidates.filter(item =>
            !item.candidate.equals(candidateId)
        )

        await job.save()
        return res.status(200).json({ message: "candidate accepted successfully", job })

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }
}
export const rejectCandidate=async(req , res, next)=>{
    try {
        const {jobId , candidateId}=req.params
        const job = await Job.findById(jobId)
        const company = await Company.findById(job.company)
        if(!job)
            return res.status(404).json({message : "job not found"})
        const isShortlisted = job.shortlistedCandidates.find(item=>item.id === candidateId)
        if(!isShortlisted)
            return res.status(400).json({message : "candidate is not shortlisted for this job"})
        const isAdmin = company.admin.adminEmail === req.user.email
        const isEmployer = company.employees.find(emp=>emp.user.equals(req.user.id) && emp.status === "approved")
        if(!isAdmin && !isEmployer)
            return res.status(403).json({message : "you are not authorized to reject a candidate"})
        job.rejectedCandidates.push({candidate:candidateId})
        await job.save()
        return res.status(200).json({message : "candidate rejected successfully" , job})
    } catch (error) {
     return res.status(500).json({message : "server error" , error : error.message})
        
    }
}











// add candidate to the shortlist of the job
export const addCanToShortlist = async(req ,res, next)=>{
   try {
    const {jobId}= req.params
    const {CandidateEmail} = req.body
    if(!CandidateEmail)
        return res.status(400).json({message : "email is required for the candidate to be shortlisted"})
    const Candidate = await User.findOne({email:CandidateEmail})
    if(!Candidate)
        return res.status(400).json({message : "candidate not found make sure you entered the correct email"})
    const CandidateId = Candidate._id
    if(!jobId)
        return res.status(404).json({message : "job not found"})
    const job = await Job.findById(jobId)
    if(req.user.role !== "admin")
        return res.status(499).json({message: "you are not authorized to add candidate"})
    const findIfCandidateAlreadyExists = job.shortlistedCandidates.find((emp)=>{
        return emp.toJSON() ==CandidateId.toJSON()
    })
    if (findIfCandidateAlreadyExists)
        return res.status(200).json({message : "candidate already on the shortlist"})
    job.shortlistedCandidates.push(CandidateId)
    await job.save()
    return res.status(200).json({message : "user add to the shortlist of the job correctly" , shortlisted : job.shortlistedCandidates})
   } catch (error) {
    return res.status(500).json({message : "server error" , error : error.message})
    
   }
}
// remove a candidate from the shortlist
export const deleteCandidateFromShortlist = async(req ,res , next)=>{
    try {
        const {jobId} = req.params
        const {candidateEmail}= req.body
        if(req.user.role !=="admin")
            return res.status(400).json({message: "you are not authorized to remove a candidate"})
        const candidate= await User.findOne({email:candidateEmail})
        if(!candidate)
            return res.status(404).json({message : "candidate not found"})
        const candidateId = candidate._id
        const job = await Job.findById(jobId)
        if(!job)
            return res.status(404).json({message : "job not found "})
        job.shortlistedCandidates=job.shortlistedCandidates.filter((emp)=>{
            return emp.toJSON() !==candidateId.toJSON()
        })
        await job.save()
        return res.status(200).json({message : "user removed successfully"})
     
    } catch (error) {
    return res.status(500).json({message : "server error" , error : error.message})
        
    }
}