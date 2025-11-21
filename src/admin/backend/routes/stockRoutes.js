import express from "express";
import {
  addStock,
  updateStockById,
  getStock,
  getSuppliers,
  getEmployees,
  addEmployee,
  updateEmployeeById,
  archiveEmployee,
  addSupplier,
    getAllSuppliers,
    getAllEmployee,
    getEmployeeImage,
    archiveStock,
    getArchivedStock,
    archiveSupplier,
    updateSupplierById,
    getArchivedEmployees,
    getArchivedSuppliers,
    restoreArchivedEmployee,
    restoreArchivedStock,
    restoreArchivedSupplier,
    deleteArchivedEmployee,
    deleteArchivedSupplier,
    deleteArchivedStock,
} from "../controller/userController.js";

const router = express.Router();

router.post("/stock", addStock);
router.put("/update/stock/:id", updateStockById);
router.get("/get", getStock);
router.get("/suppliers", getSuppliers);
router.get("/employees", getEmployees);
router.post("/add/suppliers", addSupplier);
router.get("/suppliers/all", getAllSuppliers);
router.put("/archived/stock/:id", archiveStock);
router.put("/deleted/supplier/:id", archiveSupplier);
router.put("/update/supplier/:id", updateSupplierById);
router.get("/employees/all", getAllEmployee);
router.get('/employees/:id/image', getEmployeeImage);
router.post("/add/employee", addEmployee);
router.put("/update/employee/:id", updateEmployeeById);
router.put("/delete/employee/:id", archiveEmployee);

router.get("/archived/employee", getArchivedEmployees);
router.get("/archived/stock", getArchivedStock);
router.get("/archived/supplier", getArchivedSuppliers);

router.put("/archived/restore/employee/:id", restoreArchivedEmployee);
router.put("/archived/restore/supplier/:id", restoreArchivedSupplier);
router.put("/archived/restore/stock/:id", restoreArchivedStock);

router.delete("/archived/delete/employee/:id", deleteArchivedEmployee);
router.delete("/archived/delete/supplier/:id", deleteArchivedSupplier);
router.delete("/archived/delete/stock/:id", deleteArchivedStock);

export default router;
