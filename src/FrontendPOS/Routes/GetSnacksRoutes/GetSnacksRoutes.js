import express from "express";
import { getSnacks } from "../../controller/GetSnacksController/GetSnacksController.js";

const router = express.Router();

// GET /api/snacks/getSnacks
router.get("/getSnacks", getSnacks);

export default router;
