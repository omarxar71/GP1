import Router from "express"
import * as systemService from "./system.service.js"
import { authenticationMiddleware } from "../../middleware/authentication.js"
const router = Router()
router.post("/log-in-admins" , systemService.logInSystem)
router.post("/register-admins" , authenticationMiddleware, systemService.registerSystemAdmins)
router.get("/get-matching-candidates/:jobId" , systemService.getMatchingCandidates)
router.get("/get-all-interviews" , authenticationMiddleware , systemService.getInterviews)

router.post("/add-candidate-shortlist/:jobId" , authenticationMiddleware , systemService.sendCandidateToJob)
router.post("/remove-can-from-shortlist/:jobId" , authenticationMiddleware , systemService.deleteCandidateFromShortlist)

export default router