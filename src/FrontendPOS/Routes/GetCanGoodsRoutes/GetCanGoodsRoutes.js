import express from "express";
import { getProductsByCategory } from "../../controller/GetCanGoodsController/GetCanGoodsController.js";

const router = express.Router();

// No params here
router.get("/getCangoods", getProductsByCategory);

export default router;
