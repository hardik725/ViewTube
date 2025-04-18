import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteComment, getAllCommentVideo, postComment, updateComment } from "../controllers/comment.controllers.js";

const router = Router();

router.route("/add/:videoId").post(verifyJWT,postComment);

router.route("/update/:commentId").post(updateComment);

router.route("/getAllComments/:videoId").post(getAllCommentVideo);

router.route("/delete/:commentId").post(deleteComment);

export default router;