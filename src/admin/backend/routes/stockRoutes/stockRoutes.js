import express from "express";
import {
  addStock,
  updateStockById,
  getStock,
  getSuppliers,
  getEmployees,
  archiveStock,
  getArchivedStock,
  addSupplier,
} from "../../controller/stockController/stockController.js";
import upload from "../../middleware/uploadimage.js"; // ✅ import multer

const router = express.Router();

// ✅ apply multer for file + form-data
router.post("/stock", upload.single("image"), addStock);
router.put("/update/stock/:id", upload.single("image"), updateStockById); // if updating image too

router.get("/get", getStock);
router.put("/archived/stock/:id", archiveStock);
router.get("/suppliers", getSuppliers);
router.get("/employees", getEmployees);
router.get("/archived/stock", getArchivedStock);
router.post("/add/suppliers", addSupplier);

export default router;
