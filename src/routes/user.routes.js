import { Router } from "express";
import { registerUser,LoginUser, logoutUser } from "../controllers/user.controller.js";
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


export default router;