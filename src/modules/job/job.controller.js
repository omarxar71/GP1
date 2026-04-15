import Router from "express"
import * as jobService from "./job.service.js"
import { authenticationMiddleware } from '../../middleware/authentication.js';
const router =Router()
router.post("/createJob/:companyId" , authenticationMiddleware , jobService.postJob)
router.delete("/delete-job/:jobId" , authenticationMiddleware , jobService.deleteJob)
router.get("/getSpecificCompanyJobs/:companyId" , authenticationMiddleware , jobService.getJobsOfSpecificCompany)
router.post("/getAllJobs" , authenticationMiddleware , jobService.getAllJobs)
router.get("/get-shortListed-Of-Company/:jobId",authenticationMiddleware , jobService.shortListedForCompany)
router.post("/add-candidate-shortlist/:jobId" , authenticationMiddleware , jobService.addCanToShortlist)
router.post("/remove-can-from-shortlist/:jobId" , authenticationMiddleware , jobService.deleteCandidateFromShortlist)
export default router