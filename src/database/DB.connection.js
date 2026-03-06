import mongoose from "mongoose";
export const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI).then(()=>console.log("connected successfully to the database")).catch((err)=>console.log(`err: ${err}`));
}