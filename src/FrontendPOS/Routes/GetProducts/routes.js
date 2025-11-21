// routes/productRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import {
  getAllProducts,
  getProductById,
} from "../../controller/GetProductController/getProducts.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);

export default router;
