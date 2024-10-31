import cookieParser from 'cookie-parser';
import express from 'express';
const app = express();
app.use(cookieParser());
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true}));
app.use(cors(
    {
        origin: "http://localhost:3000",
        credentials: true
    }
))
app.use(express.static("public"));


//routes import
import userRouter from './routes/user.routes.js';

//routes declaration
app.use("/api/v1/users",userRouter)
export {app};