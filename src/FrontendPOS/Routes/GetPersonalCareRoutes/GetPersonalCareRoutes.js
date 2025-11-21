import express from "express";
import { getPersonalCare } from "../../controller/GetPersonalCareController/GetPersonalCareController.js";

const router = express.Router();

// GET /api/personalcare/getPersonalCare
router.get("/getPersonalCare", getPersonalCare);

export default router;
