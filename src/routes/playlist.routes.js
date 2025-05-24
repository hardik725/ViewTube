import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addToPlaylist, createPlaylist, userPlaylist, removeVideo, removePlaylist, updatePlaylist, getPlaylistData } from "../controllers/playlist.controllers.js";

const router = Router();

router.route("/create").post(verifyJWT,createPlaylist);

router.route("/addVideo/:playlistId").post(addToPlaylist);

router.route("/userPlaylist/:userId").post(userPlaylist);

router.route("/removeVideo/:playlistId").post(removeVideo);

router.route("/removePlaylist/:playlistId").post(removePlaylist);

router.route("/update/:playlistId").post(updatePlaylist);

router.route("/getData/:playlistId").get(getPlaylistData);

export default router;