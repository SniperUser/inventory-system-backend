import express from "express";
import { getRice } from "../../controller/GetRiceController/GetRiceController.js";

const router = express.Router();

// GET /api/rice/getRice
router.get("/getRice", getRice);

export default router;
