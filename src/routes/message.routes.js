import { Router } from "express";
import { deleteMessage, getMessage, sendMessage, updateMessage } from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/getMessages/:channelId").post(verifyJWT,getMessage);

router.route("/sendMessage").post(verifyJWT,sendMessage);

router.route("/delete/:messageId").post(deleteMessage);

router.route("/update/:messageId").post(updateMessage);

export default router;
