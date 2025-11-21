// routes/sales.js
import express from "express";
import { getSales } from "../../controller/salesController/salesController.js";

const router = express.Router();

router.get("/get", getSales);

export default router;
