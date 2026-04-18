import { Job } from "../../database/job/job.model.js"
import User from "../../database/User/user.model.js"
import { compareHash, hashing } from "../../utils/hashing/hashing.js"
import { generateToken } from "../../utils/token/token.js"



export const seedSuperAdmin = async () => {
    try {
        const hashedPassword = hashing({ plainText: process.env.SUPERADMINPASSWORD })
        const user = await User.create({
            email: process.env.SUPERADMINEMAIl,
            password: hashedPassword,
            role: "superAdmin",
            isVerified: true,
            firstName: "omar",
            lastName: "abdrabo",
            phoneNumber: "01000000000",


        })
       console.log("super admin created successfully")
    } catch (error) {
        console.log(error.message)
    }
}


export const logInSystem = async(req , res , next)=>{
    const {email , password}=req.body
    const user = await User.findOne({email})
    if(!user)
        return res.status(404).json({message:"user not found"})
    if(user.role !== "systemAdmin" && user.role !== "superAdmin")
        return res.status(400).json({message : "you are not authorized to call this api"})
    const doesPasswordMatches = compareHash({plainText:password ,hashedText:user.password})
    if(!doesPasswordMatches)
        return res.status(400).json({message : "invalid password"})
    const token = generateToken({plainText:{id:user._id , role:user.role , email:user.email}})

    return res.status(200).json({message : "login successfully" , token})
    
}


export const registerSystemAdmins = async (req, res, next) => {
    try {
        const {email , password , firstName , lastName , phoneNumber} = req.body
        const user = await User.findOne({email})
        if(!req.user.role ==="superAdmin")
            return res.status(400).json({message : "you are not authorized to call this api"})
        if(user){
            return res.status(400).json({message:"user already exists"})
        }
        const hashedPassword = hashing({ plainText: password })
        const newUser = await User.create({
            email,
            password: hashedPassword,
            role: "systemAdmin",
            isVerified: true,
            firstName,
            lastName,
            phoneNumber,
        })
        return res.status(201).json({message:"system admin created successfully" , user:newUser})
    } catch (error) {
        return res.status(500).json({message:"internal server error" , error : error.message})
    }
}



export const getMatchingCandidates = async (req, res, next) => {
    try {
        const { jobId } = req.params

        // step 1 — get the job to know its requirements
        const job = await Job.findById(jobId)
        if (!job)
            return res.status(404).json({ message: "job not found" })

        // step 2 — use the job requirements to filter candidates
        const matchingCandidates = await User.find({
            role: "candidate",
            "candidateProfile.status": "Available",
            "candidateProfile.specialization": job.category,
            "candidateProfile.experienceLevel": job.experienceLevel,
            "candidateProfile.workType": job.workType,
            "candidateProfile.expectedSalary": { $lte: job.budget }
        })
        if(matchingCandidates.length === 0)
            return res.status(200).json({message : "no matching candidates found"})

        return res.status(200).json({ 
            message: "matching candidates found", 
            total: matchingCandidates.length,
            candidates: matchingCandidates 
        })

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }
}


// add candidate to the shortlist of the job
export const sendCandidateToJob = async (req, res, next) => {
    try {
        const { jobId } = req.params
        const { candidateId } = req.body

        // get the job
        const job = await Job.findById(jobId)
        if (!job)
            return res.status(404).json({ message: "job not found" })

        // only systemAdmin or superAdmin can send candidates
        if (req.user.role !== "systemAdmin" && req.user.role !== "superAdmin")
            return res.status(403).json({ message: "you are not authorized to send candidates" })

        // get the candidate
        const candidate = await User.findById(candidateId)
        if (!candidate)
            return res.status(404).json({ message: "candidate not found" })

        // make sure they are actually a candidate
        if (candidate.role !== "candidate")
            return res.status(400).json({ message: "this user is not a candidate" })

        // make sure candidate is available and not already hired
        if (candidate.candidateProfile.status !== "Available")
            return res.status(400).json({ message: "this candidate is not available" })

        // check if already sent to this job
        const alreadySent = job.shortlistedCandidates.find(item =>
            item.candidate.equals(candidateId)
        )
        if (alreadySent)
            return res.status(400).json({ message: "candidate already sent to this job" })

        // add to sentCandidates
        job.shortlistedCandidates.push({
            candidate: candidateId,
            sentBy: req.user.id,
            sentAt: Date.now()
        })

        await job.save()

        return res.status(200).json({ 
            message: "candidate sent to job successfully", 
            sentCandidates: job.shortlistedCandidates 
        })

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message })
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