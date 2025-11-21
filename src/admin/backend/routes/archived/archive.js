import express from "express";
import {
  restoreArchivedEmployee,
  restoreArchivedSupplier,
  restoreArchivedStock,
  deleteArchivedEmployee,
  deleteArchivedSupplier,
  deleteArchivedStock,
} from "../../controller/archived/archivedController.js";

const router = express.Router();
// Restore archived employee
router.put("/archived/restore/employee/:id", restoreArchivedEmployee);
router.put("/archived/restore/supplier/:id", restoreArchivedSupplier);
router.put("/archived/restore/stock/:id", restoreArchivedStock);

router.delete("/archived/delete/employee/:id", deleteArchivedEmployee);
router.delete("/archived/delete/supplier/:id", deleteArchivedSupplier);
router.delete("/archived/delete/stock/:id", deleteArchivedStock);

export default router;
