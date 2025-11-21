// instantNoodlesRoutes.js
import express from "express";
import { getInstantNoodles } from "../../controller/GetInstantNoodles/GetInstantNoodleController.js";

const router = express.Router();

// ✅ Route to fetch all Instant Noodles products
router.get("/getInstantNoodles", getInstantNoodles);

export default router;
