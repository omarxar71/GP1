import Router from "express"
import * as companyService from "../company/company.service.js";
import { authenticationMiddleware } from "../../middleware/authentication.js"
const router= Router()
router.post("/companyProfile" ,authenticationMiddleware, companyService.CreateCompanyProfile)
router.get("/getCompanyProfile/:companyId" , authenticationMiddleware , companyService.getCompanyProfile)
router.post("/verifyCompanyEmail" ,authenticationMiddleware, companyService.verifyCompanyEmail)
router.post("/requestToJoinCompany" , authenticationMiddleware , companyService.requestRegisterForCompany)
router.get("/getAllPendingForCompany/:companyId",authenticationMiddleware ,companyService.getAllThePendingListForCompany )
router.put("/acceptOrRejectEmp/:companyId" , authenticationMiddleware , companyService.acceptOrRejectEmp)

export default router