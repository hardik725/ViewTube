import { Router } from "express";
import { uploadAudio } from "../controllers/audioTranscript.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/transcribe").post(upload.single("file"),uploadAudio);

export default router;