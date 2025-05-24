import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteTweet, getAllTweets, postTweet, tweetByUserId, updateTweet } from "../controllers/tweet.controller.js";

const router = Router();

router.route("/post").post(verifyJWT,
    postTweet
);

router.route("/getAllTweets").get(getAllTweets);

router.route("/update/:tweetId").post(updateTweet);

router.route("/delete/:tweetId").post(deleteTweet);

router.route("/userTweets").post(verifyJWT,tweetByUserId);

export default router;