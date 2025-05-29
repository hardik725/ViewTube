import express from "express";
import { sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

// Route to send message with socket.io integration
router.post("/sendMessage", (req, res, next) => {
  // Attach io instance to request object
  req.io = req.app.get("io");
  sendMessage(req, res, next);
});

export default router;
