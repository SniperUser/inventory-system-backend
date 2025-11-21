import express from "express";
import { getHouseholdItems } from "../../controller/GetHouseHoldController/GetHouseHoldController.js";

const router = express.Router();

// GET /api/household/getHouseholdItems
router.get("/getHouseholdItems", getHouseholdItems);

export default router;
