import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { bootstrap } from './src/app.controller.js';
import { v2 as cloudinary } from 'cloudinary';

// 1. Load config FIRST
dotenv.config(); 


const app = express();
// 2. Port will now correctly read from .env or default to 5000
const port = 3004 || process.env.PORT;

// 3. Initialize routes and middleware
bootstrap(app, express);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


