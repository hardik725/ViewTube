import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllTweets, postTweet } from "../controllers/tweet.controller.js";

const router = Router();

router.route("/post").post(verifyJWT,
    postTweet
);

router.route("/getAllTweets").post(getAllTweets);

export default router;