import express from "express";
import {getAllSuppliers, updateSupplierById, addSupplier, archiveSupplier} from "../../controller/supplierController/supplierController.js"

const router = express.Router();

router.get("/suppliers/all", getAllSuppliers);
router.put("/update/supplier/:id", updateSupplierById);
router.post("/add/suppliers", addSupplier);
router.put("/deleted/supplier/:id", archiveSupplier);


export default router;