import Router from "express"
import * as jobService from "./job.service.js"
const router =Router()
router.post("/add-job" , jobService.postJob)




export default router