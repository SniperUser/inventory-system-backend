import express from "express";
import { getLaundry } from "../../controller/GetLaundryController/GetLaundryController.js";

const router = express.Router();

// GET /api/laundry/getLaundry
router.get("/getLaundry", getLaundry);

export default router;
