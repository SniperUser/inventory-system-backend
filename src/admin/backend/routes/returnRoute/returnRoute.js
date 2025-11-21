// routes/returns.js
import express from "express";
import { getReturns } from "../../controller/returnController/returnController.js";

const router = express.Router();

router.get("/get", getReturns); // ✅ Fetch all returns

export default router;
