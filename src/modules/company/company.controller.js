import Router from "express"
import * as companyService from "../company/company.service.js";
import { authenticationMiddleware } from "../../middleware/authentication.js"
const router= Router()
router.post("/companyProfile" ,authenticationMiddleware, companyService.CreateCompanyProfile)
router.get("/getCompanyProfile/:companyId" , authenticationMiddleware , companyService.getCompanyProfile)
router.post("/verifyCompanyEmail" ,authenticationMiddleware, companyService.verifyCompanyEmail)
router.get("/getSpecificCompanyJobs/:companyId" , authenticationMiddleware , companyService.getJobsOfSpecificCompany)
router.get("/getCompanyInterviews/:companyId", authenticationMiddleware, companyService.getCompanyInterviews)
router.put("/updateInterviewStatus/:interviewId", authenticationMiddleware, companyService.updateInterviewStatus)
router.post("/registerEmployee/:companyId", authenticationMiddleware, companyService.registerCompanyEmployee)

export default router