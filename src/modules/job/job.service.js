import User from "../../database/User/user.model.js"
import { Company } from '../../database/company/company.model.js';
import { Job } from '../../database/job/job.model.js';
//employer post the job to the system
export const postJob= async (req ,res ,next)=>{
    //1-take the job specifics 
    //2-make sure that the person trying to post a job is employer
    //3- make sure that the employer trying to post for a company is registered for that company
        //a- take the userid of the employer who are trying to post a job
        //b-take the company id that this employer trying to post to
        //c-post the job to the system
try{
    const userId= req.user.id
    const {companyId} = req.params
    const {title , category , description ,skillsRequired ,experienceLevel ,minExperience ,budget ,workType}= req.body
    const findCompany = await Company.findById(companyId)
    if(!findCompany)
        return res.status(404).json({message : "company not found"})
    //search for the user in that company 
    const searchUser = findCompany.employees.find((user)=>{
        return user.user.toString() == userId.toString()
    })
    if(searchUser == undefined)
        return res.status(404).json({message : "you are not authorized to post for this company"})
    
    const createJob = await Job.create({
        title,company:companyId,employerId:userId, category , description ,skillsRequired ,experienceLevel ,minExperience ,budget ,workType
    })
    return res.status(200).json({message : "job created successfully" , job:createJob})
}
catch{
    return res.status(500).json({ message: "Internal server error", error: error.message });
}
}
//delete job
export const deleteJob = async(req ,res,next)=>{
    const {jobId} = req.params
    const job = await Job.findById(jobId)
    if(!job.employerId == req.user.id || !req.user.role =="admin"){
        return res.status(400).json({message : "you are not authorized to delete this job"})

    }
    await job.deleteOne()
    return res.status(200).json({message :"job deleted successfully"})
}
//get all the jobs posted by a specific company only system can see this lists 
export const getJobsOfSpecificCompany = async(req ,res , next)=>{
  try {
    const {companyId} = req.params

    if(req.user.role !== "employer" )
        return res.status(404).json({message : "you are not authorized to see that"})
    const findJobs = await Job.find(companyId)
    return res.status(200).json({message : "all jobs" , jobs:findJobs})
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
    const job = await Job.findOne(jobId)
    const companyId = job.company
    const findCompany = await Company.findById(companyId)
    if (!job)
        return res.status(435).json({message : "job not found"})
    const findIfEmployerOfCompany = findCompany.employees.map((emp)=>{
        if(emp ==EmployerId){
            return emp
        }else{
            return res.status(404).json({message : "you are not an employer for this company"})
        }
        
    })
    if(findIfEmployerOfCompany)
        return res.status(200).json({message : "all the shortlisted for this job"  , shortListedForCompany:job.shortlistedCandidates})
    
    return res.status(200).json({message : "all the shortListed for this job"})
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