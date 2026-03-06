import cors from 'cors';
import {connectDB} from './database/DB.connection.js';
import authRouter from './modules/auth/auth.controller.js';
import userRouter from './modules/user/user.controller.js';
export const bootstrap =async(app ,express)=>{
    console.log("Bootstrap is running..."); // TEST 1
    app.use(express.json());
    app.use(cors())
    console.log("Registering /auth route..."); // TEST 2
    await connectDB();


    app.get("/ping", (req, res) => res.send("pong"));



    app.use("/auth", authRouter)
    app.use("/user", userRouter)
    // TEST 3: Direct route to bypass the imported router
}