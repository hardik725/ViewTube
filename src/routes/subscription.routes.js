import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { channelSubscribers, subChannel, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();

router.route("/toggle/:channelId").post(verifyJWT,toggleSubscription);

router.route("/subs-data").post(verifyJWT,channelSubscribers);

router.route("/sub-channel").post(verifyJWT,subChannel);

export default router;