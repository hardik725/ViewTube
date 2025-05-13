import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, togglePublication, updateVideo, uploadVideo } from "../controllers/video.controller.js";

const router = Router();

router.route("/upload").post(verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        }
    ]),
    uploadVideo
);

router.route("/toggle-publish/:videoId").post(togglePublication);

router.route("/update-video/:videoId").post(upload.single("thumbnail"),updateVideo);

router.route("/delete-video/:videoId").post(deleteVideo);

router.route("/getVideo").post(getAllVideos);

router.route("/getVideoById/:videoId").get(getVideoById);


export default router;