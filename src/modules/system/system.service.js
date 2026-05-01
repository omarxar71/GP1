import { Interview } from "../../database/interview/interview.model.js"
import { Job } from "../../database/job/job.model.js"
import User from "../../database/User/user.model.js"
import { compareHash, hashing } from "../../utils/hashing/hashing.js"
import { generateToken } from "../../utils/token/token.js"
import axios from 'axios';
import { CanvasFactory } from 'pdf-parse/worker'; 
import { PDFParse } from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';


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


export const logInSystem = async (req, res, next) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user)
        return res.status(404).json({ message: "user not found" })
    if (user.role !== "systemAdmin" && user.role !== "superAdmin")
        return res.status(400).json({ message: "you are not authorized to call this api" })
    const doesPasswordMatches = compareHash({ plainText: password, hashedText: user.password })
    if (!doesPasswordMatches)
        return res.status(400).json({ message: "invalid password" })
    const token = generateToken({ plainText: { id: user._id, role: user.role, email: user.email } })

    return res.status(200).json({ message: "login successfully", token })

}


export const registerSystemAdmins = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, phoneNumber } = req.body
        const user = await User.findOne({ email })
        if (!req.user.role === "superAdmin")
            return res.status(400).json({ message: "you are not authorized to call this api" })
        if (user) {
            return res.status(400).json({ message: "user already exists" })
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
        return res.status(201).json({ message: "system admin created successfully", user: newUser })
    } catch (error) {
        return res.status(500).json({ message: "internal server error", error: error.message })
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
        if (matchingCandidates.length === 0)
            return res.status(200).json({ message: "no matching candidates found" })

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
export const deleteCandidateFromShortlist = async (req, res, next) => {
    try {
        const { jobId } = req.params
        const { candidateId } = req.body

        // only systemAdmin or superAdmin can remove candidates
        if (req.user.role !== "systemAdmin" && req.user.role !== "superAdmin")
            return res.status(403).json({ message: "you are not authorized to remove a candidate" })

        // get the job
        const job = await Job.findById(jobId)
        if (!job)
            return res.status(404).json({ message: "job not found" })

        // get the candidate
        const candidate = await User.findById(candidateId)
        if (!candidate)
            return res.status(404).json({ message: "candidate not found" })

        // check if candidate is in the shortlist
        const isInShortlist = job.shortlistedCandidates.find(item =>
            item.candidate.equals(candidateId)
        )
        if (!isInShortlist)
            return res.status(400).json({ message: "candidate is not in the shortlist" })

        // remove from shortlistedCandidates
        job.shortlistedCandidates = job.shortlistedCandidates.filter(item =>
            !item.candidate.equals(candidateId)
        )

        await job.save()

        return res.status(200).json({
            message: "candidate removed from shortlist successfully",
            shortlistedCandidates: job.shortlistedCandidates
        })

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }
}


export const getInterviews = async (req, res, next) => {
    try {
        const adminId = req.user.id
        const user = await User.findById(adminId)
        if (!user)
            return res.status(404).json({ message: "user not found" })
        if (user.role !== "systemAdmin" && user.role !== "superAdmin")
            return res.status(403).json({ message: "you are not authorized to get interviews" })
        const interviews = await Interview.find().populate("candidate")
        if (!interviews)
            return res.status(404).json({ message: "interviews not found" })
        return res.status(200).json({ message: "interviews found", interviews })
    } catch (error) {
        return res.status(500).json({ message: "internal server error", error: error.message })
    }
}


export const getAllJobs = async (req, res, next) => {
    try {
        const adminId = req.user.id
        const user = await User.findById(adminId)
        if (!user)
            return res.status(404).json({ message: "user not found!" })
        if (user.role !== "systemAdmin" && user.role !== "superAdmin")
            return res.status(403).json({ message: "you are not authorized to get jobs" })
        const jobs = await Job.find()
            .populate("company")
            .populate("employerId")
            .populate("shortlistedCandidates.candidate")

        // attach interviews to each job
        const jobsWithInterviews = await Promise.all(
            jobs.map(async (job) => {
                const interviews = await Interview.find({ job: job._id })
                    .populate("candidate")
                    .populate("scheduledBy")
                return { ...job.toObject(), interviews }
            })
        )

        if (!jobsWithInterviews || jobsWithInterviews.length === 0)
            return res.status(200).json({ message: "no jobs found", jobs: [] })
        return res.status(200).json({ message: "jobs found", total: jobsWithInterviews.length, jobs: jobsWithInterviews })
    } catch (error) {
        return res.status(500).json({ message: "internal server error", error: error.message })
    }
}

export const predictProbationSuccess = async (req, res, next) => {
    try {
        // 1. Initialize Gemini inside the function
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        const { candidateId } = req.params;
        const { jobTitle, jobDescription } = req.body;

        if (!jobTitle || !jobDescription) {
            return res.status(400).json({ message: "Please provide the jobTitle and jobDescription in the request body." });
        }

        // 2. Find the candidate
        const candidate = await User.findById(candidateId);
        if (!candidate || !candidate.candidateProfile.cvUrl) {
            return res.status(404).json({ message: "Candidate not found or has no CV uploaded." });
        }

        // 3. Fetch and parse the CV from Cloudinary (exactly like the fraud check)
        const response = await axios.get(candidate.candidateProfile.cvUrl, {
            responseType: 'arraybuffer'
        });

        const parser = new PDFParse({ 
            data: Buffer.from(response.data), 
            CanvasFactory 
        });
        const pdfData = await parser.getText();
        const cvText = pdfData.text;

        // 4. The Predictive AI Prompt
        const prompt = `
            You are an expert HR Data Scientist and Technical Recruiter.
            Evaluate the following candidate's CV against the provided Job Description to predict their likelihood of successfully passing a 3-month probation period without quitting or being fired.
            
            Look for: 
            - Tenure at previous jobs (are they a job-hopper?)
            - Relevance of their tech stack to the job description
            - Seniority level matching (e.g., a junior applying for a lead role is high risk)

            Return ONLY a valid JSON object with this exact structure, no markdown formatting, no extra text:
            {
              "successProbability": <Number 0-100>,
              "predictionStatus": <String: "High Risk", "Moderate Risk", or "Strong Fit">,
              "strengths": [<Array of Strings: Specific reasons they will succeed>],
              "riskFactors": [<Array of Strings: Specific reasons they might fail or quit>]
            }

            Job Title: ${jobTitle}
            Job Description: ${jobDescription}

            Candidate CV:
            ${cvText}
        `;

        // 5. Run the Gemini analysis
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const aiResponse = await model.generateContent(prompt);
        const responseText = aiResponse.response.text();

        // 6. Clean and parse the JSON response
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const predictionAnalysis = JSON.parse(cleanJson);

        // 7. Return the prediction to the Employer
        return res.status(200).json({
            message: "Probation prediction complete",
            candidateName: candidate.firstName ? `${candidate.firstName} ${candidate.lastName}` : candidate.email,
            evaluation: predictionAnalysis
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
