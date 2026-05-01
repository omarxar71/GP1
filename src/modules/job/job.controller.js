import Router from "express"
import * as jobService from "./job.service.js"
import { authenticationMiddleware } from '../../middleware/authentication.js';
const router =Router()
router.post("/createJob/:companyId" , authenticationMiddleware , jobService.postJob)
router.get("/get-company-to-store-id" , authenticationMiddleware , jobService.getMyCompany)
router.delete("/delete-job/:jobId" , authenticationMiddleware , jobService.deleteJob)
router.post("/getAllJobs" , authenticationMiddleware , jobService.getAllJobs)
router.get("/get-shortListed-candidates-Of-specific-job/:jobId",authenticationMiddleware , jobService.shortListedCandidatesofSpecifcJobForCompany)
router.post("/accept-candidate-from-shortlisting/:jobId/:candidateId", authenticationMiddleware , jobService.acceptCandidate)
router.post("/reject-candidate-from-shortlisting/:jobId/:candidateId" , authenticationMiddleware , jobService.rejectCandidate)






export default router