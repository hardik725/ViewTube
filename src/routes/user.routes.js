import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
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

export default router;