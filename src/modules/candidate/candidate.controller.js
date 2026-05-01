import { Router } from "express";
import { authenticationMiddleware } from "../../middleware/authentication.js";
import * as candidateService from "./candidate.service.js";
import { uploadCV } from "../../middleware/multer.js";
const router = Router()
router.get("/candidate-profile" , authenticationMiddleware , candidateService.getCandidateProfile)
router.post("/upload-cv", authenticationMiddleware, uploadCV.single("cv"), candidateService.uploadCandidateCV);
router.post("/cv-fraud-check", authenticationMiddleware, candidateService.checkMyCvFraud)
router.get("/my-interviews", authenticationMiddleware, candidateService.getCandidateInterviews)
router.get("/candidate-interviews/:candidateId", authenticationMiddleware, candidateService.getCandidateInterviews)



export default router