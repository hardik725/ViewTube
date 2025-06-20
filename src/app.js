import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// helps to control from where and how the backend can interact with the frontend
app.use(cors({
    origin: true,
    credentials: true
}));

// it limit the size of file which we are getting and sending in server
app.use(express.json({limit: "100mb"}));
// this help to show convert small things like blank spaces and other things that are being sent in the server
app.use(express.urlencoded({extended: true, limit: "100mb"}));
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

import dashboardRouter from "./routes/dashboard.routes.js";

import healthScoreRouter from "./routes/heatlhScore.routes.js";

import messageRouter from "./routes/message.routes.js";

import notificationRouter from "./routes/notification.routes.js";
// routes declaration
app.use("/api/v1/users",userRouter);
app.use("/api/v1/subscription",subscriptionRouter);
app.use("/api/v1/video",videoRouter);
app.use("/api/v1/tweet",tweetRouter);
app.use("/api/v1/comment",commentRouter);
app.use("/api/v1/like",likeRouter);
app.use("/api/v1/playlist",playlistRouter);
app.use("/api/v1/dashboard",dashboardRouter);
app.use("/api/v1/health",healthScoreRouter);
app.use("/api/v1/message",messageRouter);
app.use("/api/v1/notification",notificationRouter);


export {app};