import express from "express";
import {
  getProducts,
  createSalesOrder,
  verifyCustomer,
  getSalesWithPaymentStatus,
  moveToDelivery,
  completeSalesOrder,
  createPickupOrder,
} from "./cashieringcontroller.js";

const router = express.Router();

// -------------------- Products --------------------
router.get("/", getProducts); // GET all products

// -------------------- Sales --------------------
router.post("/delivery", createSalesOrder); // POST a new delivery order
router.post("/pickup", createPickupOrder);
router.post("/verify-customer", verifyCustomer); // POST to verify customer

// -------------------- Sales with Payment Status --------------------
router.get("/sales-status", getSalesWithPaymentStatus); // GET sales_done with payment_status

// -------------------- Move Sales → Delivery --------------------
router.post("/accept-cod/:id", moveToDelivery);

// -------------------- Move sales_order to sales done --------------------
router.post("/move-sales", completeSalesOrder);

export default router;
