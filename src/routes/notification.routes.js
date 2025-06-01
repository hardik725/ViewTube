import { Router } from "express";
import { getNotification, addNotification, markRead } from "../controllers/notification.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/getNotification").get(verifyJWT,getNotification);

router.route("/addNotification/:recieverId").post(verifyJWT,addNotification);

router.route("/mark/:notificationId").post(markRead);

export default router;