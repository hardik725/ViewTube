import { Router } from "express";
import { registerUser,LoginUser, logoutUser, refreshAccessToken, changeCurrentUserPassword, getCurrentUser, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory, updateAccountDetails } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
// this is a middle which comes between the req and response given by the server
// when we register the call goes through this middleware before it reaches the server

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]), // middleware comes just before the function to be executed
    registerUser);

router.route("/login").post(LoginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT,changeCurrentUserPassword);

router.route("/current-user").post(verifyJWT,getCurrentUser);

router.route("/change-accDetails").post(verifyJWT,updateAccountDetails);

router.route("/update-avatar").patch(verifyJWT,
    upload.single("avatar"
    ),updateUserAvatar
);

router.route("/update-coverImage").patch(verifyJWT,
    upload.single("coverImage"
    ),updateUserCoverImage
);

router.route("/channeldata/:username").post(verifyJWT,getUserChannelProfile);

router.route("/UserWatchHistory").post(verifyJWT,getWatchHistory);

export default router;