import { Job } from "../../database/job/job.model.js"
import { Company } from "../../database/company/company.model.js"
import User from "../../database/User/user.model.js"
import { Interview } from "../../database/interview/interview.model.js"

// company employer schedules an interview for an accepted candidate
export const scheduleInterview = async (req, res, next) => {
    try {
        const { scheduledAt, type, location } = req.body
        const { jobId, candidateId } = req.params

        const job = await Job.findById(jobId)
        if (!job)
            return res.status(404).json({ message: "job not found" })

        // make sure the company employer owns this job
        const findCompany = await Company.findById(job.company)
        const isAdmin = findCompany.admin.adminEmail === req.user.email
        const systemAdmin = req.user.role === "systemAdmin"
        const superAdmin = req.user.role === "superAdmin"
        const isEmployee = findCompany.employees.find(emp =>
            emp.user.equals(req.user.id) && emp.status === "approved"
        )

        if (!isAdmin && !isEmployee && !systemAdmin && !superAdmin)
            return res.status(403).json({ message: "you are not authorized" })

        // make sure candidate was accepted before scheduling
        const isAccepted = job.acceptedCandidates.find(item =>
            item.candidate.equals(candidateId)
        )
        if (!isAccepted)
            return res.status(400).json({ message: "you can only schedule interviews for accepted candidates" })

        // make sure no interview already exists for this candidate on this job
        const existingInterview = await Interview.findOne({ job: jobId, candidate: candidateId })
        if (existingInterview)
            return res.status(400).json({ message: "interview already scheduled for this candidate" })

        const interview = await Interview.create({
            job: jobId,
            candidate: candidateId,
            company: job.company,
            scheduledBy: req.user.id,
            scheduledAt,
            type,
            location
        })

        return res.status(201).json({ message: "interview scheduled successfully", interview })

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }
}

// company records the outcome after interview happens
export const updateInterviewOutcome = async (req, res, next) => {
    try {
        const { interviewId } = req.params
        const { outcome, notes } = req.body

        if (!['passed', 'failed', 'pending'].includes(outcome))
            return res.status(400).json({ message: "outcome must be passed, failed, or pending" })

        const interview = await Interview.findById(interviewId)
        if (!interview)
            return res.status(404).json({ message: "interview not found" })

        // make sure the company employer owns this interview
        const findCompany = await Company.findById(interview.company)
        const isAdmin = findCompany.admin.adminEmail === req.user.email
        const systemAdmin = req.user.role === "systemAdmin"
        const superAdmin = req.user.role === "superAdmin"
        const isEmployee = findCompany.employees.find(emp =>
            emp.user.equals(req.user.id) && emp.status === "approved"
        )
        if (!isAdmin && !isEmployee && !systemAdmin && !superAdmin)
            return res.status(403).json({ message: "you are not authorized" })

        interview.outcome = outcome
        interview.status = 'completed'
        interview.notes = notes

        await interview.save()
        return res.status(200).json({ message: "interview outcome updated", interview })

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }
}

// get all interviews for a company
export const getCompanyInterviews = async (req, res, next) => {
    try {
        const { companyId } = req.params

        const findCompany = await Company.findById(companyId)
        if (!findCompany)
            return res.status(404).json({ message: "company not found" })

        const isAdmin = findCompany.admin.adminEmail === req.user.email
        const systemAdmin = req.user.role === "systemAdmin"
        const superAdmin = req.user.role === "superAdmin"
        const isEmployee = findCompany.employees.find(emp =>
            emp.user.equals(req.user.id) && emp.status === "approved"
        )
        if (!isAdmin && !isEmployee && !systemAdmin && !superAdmin)
            return res.status(403).json({ message: "you are not authorized" })

        const interviews = await Interview.find({ company: companyId })
            .populate("candidate", "firstName lastName email candidateProfile")
            .populate("job", "title")

        return res.status(200).json({ message: "all interviews", interviews })

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }
}