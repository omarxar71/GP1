import Router from "express"
import * as jobService from "./job.service.js"
import { authenticationMiddleware } from '../../middleware/authentication.js';
const router =Router()
router.post("/createJob/:companyId" , authenticationMiddleware , jobService.postJob)
router.get("/get-company-to-store-id" , authenticationMiddleware , jobService.getMyCompany)
router.delete("/delete-job/:jobId" , authenticationMiddleware , jobService.deleteJob)
router.get("/getSpecificCompanyJobs/:companyId" , authenticationMiddleware , jobService.getJobsOfSpecificCompany)
router.post("/getAllJobs" , authenticationMiddleware , jobService.getAllJobs)
router.get("/get-shortListed-Of-Company/:jobId",authenticationMiddleware , jobService.shortListedForCompany)
router.post("/accept-candidate-from-shortlisting/:jobId/:candidateId", authenticationMiddleware , jobService.acceptCandidate)







export default router