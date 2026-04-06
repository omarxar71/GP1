import { Router } from "express";
import { authenticationMiddleware } from "../../middleware/authentication.js";
import * as candidateService from "./candidate.service.js";
const router = Router()
router.get("/candidate-profile" , authenticationMiddleware , candidateService.getCandidateProfile)





export default router