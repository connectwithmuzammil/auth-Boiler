import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/connectDB.js';
import userRoutes from "./routes/userRoute.js";


const DATABASE_URL = process.env.DATABASE_URL;


const app = express();
const port = process.env.PORT || 3000;

//CORS POLICY
app.use(cors());

//CONNECT TO DATABASE
connectDB(DATABASE_URL);

// JSON
app.use(express.json());


//LOAD ROUTES
app.use("/api/user", userRoutes);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});