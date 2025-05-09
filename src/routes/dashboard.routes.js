import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controllers.js";

const router = Router();

router.route("/data").post(verifyJWT,getChannelStats);

router.route("/channelVideo").post(verifyJWT,getChannelVideos);

export default router;