import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// 1. Load config FIRST
dotenv.config(); 

import { bootstrap } from './src/app.controller.js';

const app = express();
// 2. Port will now correctly read from .env or default to 5000
const port =3000 || process.env.PORT;

// 3. Initialize routes and middleware
bootstrap(app, express);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});