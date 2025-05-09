import { Router } from "express";
import { getHealthScore } from "../controllers/HealthCheck.controllers.js";

const router = Router();

router.route("/getHealthScore").post(getHealthScore);

export default router;