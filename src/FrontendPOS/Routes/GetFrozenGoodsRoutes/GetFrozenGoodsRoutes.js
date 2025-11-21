import express from "express";
import { getFrozenGoods } from "../../controller/GetFrozenGoodsController/GetFrozenGoodsController.js";

const router = express.Router();

// GET /api/frozen/getFrozenGoods
router.get("/getFrozenGoods", getFrozenGoods);

export default router;
