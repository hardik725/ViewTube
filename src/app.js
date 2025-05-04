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
routes
*/

import userRouter from "./routes/user.routes.js";

import subscriptionRouter from "./routes/subscription.routes.js";

import videoRouter from "./routes/video.routes.js";

import tweetRouter from "./routes/tweet.routes.js";

import commentRouter from "./routes/comment.routes.js";

import likeRouter  from "./routes/like.routes.js";

import playlistRouter from "./routes/playlist.routes.js";

// routes declaration
app.use("/api/v1/users",userRouter);
app.use("/api/v1/subscription",subscriptionRouter);
app.use("/api/v1/video",videoRouter);
app.use("/api/v1/tweet",tweetRouter);
app.use("/api/v1/comment",commentRouter);
app.use("/api/v1/like",likeRouter);
app.use("/api/v1/playlist",playlistRouter);

export {app};