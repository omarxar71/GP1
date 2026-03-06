import Router from 'express';
const router = Router();
import * as userService from './user.service.js';
import {authenticationMiddleware} from "../../middleware/authentication.js"
router.put("/updateCandidateProfile",authenticationMiddleware, userService.updateCandidateProfileDetailsAfterLogIn);
router.put("/updateCompanyProfile",authenticationMiddleware, userService.updateCompanyProfile);

export default router;