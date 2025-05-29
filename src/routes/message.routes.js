import express from "express";
import { getMessage, sendMessage } from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Route to send message with socket.io integration
router.post("/sendMessage", (req, res, next) => {
  // Attach io instance to request object
  req.io = req.app.get("io");
  sendMessage(req, res, next);
});

router.route("/getMessages/:channelId").post(verifyJWT,getMessage);

export default router;
