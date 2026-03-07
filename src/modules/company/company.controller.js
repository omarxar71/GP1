import Router from "express"
import * as companyService from "./company.service.js"
import { authenticationMiddleware } from "../../middleware/authentication.js"
const router= Router()
router.post("/companyProfile" ,authenticationMiddleware, companyService.CreateCompanyProfile)




export default router