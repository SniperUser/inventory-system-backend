import express from "express";
import { getCondiments } from "../../controller/GetCondimentsController/GetCondimentsController.js";

const router = express.Router();

// GET /api/condiments/getCondiments
router.get("/getCondiments", getCondiments);

export default router;
