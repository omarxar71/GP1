import Router from "express"
import { authenticationMiddleware } from "../../middleware/authentication.js"
import * as interviewServices from "./interview.service.js"
const router = Router()
router.post("/schedule-inerview/:jobId/:candidateId" , authenticationMiddleware , interviewServices.scheduleInterview)
router.post("/update-interview-outcome/:interviewId" , authenticationMiddleware , interviewServices.updateInterviewOutcome)
router.get("/get-company-interviews/:companyId" , authenticationMiddleware , interviewServices.getCompanyInterviews)
export default router