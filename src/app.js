import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// helps to control from where and how the backend can interact with the frontend
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// it limit the size of file which we are getting and sending in server
app.use(express.json({limit: "16kb"}));
// this help to show convert small things like blank spaces and other things that are being sent in the server
app.use(express.urlencoded({extended: true, limit: "16kb"}));
// static features are stored in our site
app.use(express.static("public"));

app.use(cookieParser());


// middlewares
/*

*/

export {app};