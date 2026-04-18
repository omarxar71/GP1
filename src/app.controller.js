import cors from 'cors';
import { connectDB } from './database/DB.connection.js';
import authRouter from './modules/auth/auth.controller.js';
import userRouter from './modules/user/user.controller.js';
import jobRouter from './modules/job/job.controller.js';
import companyRouter from './modules/company/company.controller.js';
import candidateRouter from "./modules/candidate/candidate.controller.js"
import systemRouter from "./modules/system/system.controller.js"
import { seedSuperAdmin } from "./modules/system/system.service.js"
export const bootstrap = async (app, express) => {
    console.log("Bootstrap is running..."); // TEST 1
    app.use(express.json());
    app.use(cors())
    console.log("Registering /auth route..."); // TEST 2
    await connectDB();
    await seedSuperAdmin();


    app.use("/auth", authRouter)
    app.use("/user", userRouter)
    app.use("/job", jobRouter)
    app.use("/company", companyRouter)
    app.use("/candidate", candidateRouter)
    app.use("/system", systemRouter)
}