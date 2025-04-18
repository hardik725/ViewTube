import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { postComment, updateComment } from "../controllers/comment.controllers.js";

const router = Router();

router.route("/add/:videoId").post(verifyJWT,postComment);

router.route("/update/:commentId").post(updateComment);

export default router;