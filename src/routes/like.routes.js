import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getVideos, likeVideo,removeLike, toggleLike } from "../controllers/like.controllers.js";

const router = Router();

router.route("/addLike/:id").post(verifyJWT,likeVideo);

router.route("/removeLike/:likeId").post(removeLike);

router.route("/toggleLike/:id").post(verifyJWT,toggleLike);

router.route("/getVideos").post(verifyJWT,getVideos);

export default router;