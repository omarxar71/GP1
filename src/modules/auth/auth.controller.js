import * as authService from './auth.service.js';
import {Router} from "express"
const router = Router();
//for login
router.post("/login" , authService.login);
router.post("/signUp" , authService.signUp);



export default router;
