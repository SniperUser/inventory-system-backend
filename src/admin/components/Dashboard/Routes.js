import express from "express";
import {
  getSales,
  getProducts,
  getOrders,
  getEmployees,
  getReturnSales,
  getDeliveries,
} from "./Controller.js";

const router = express.Router();

// ✅ Sales Report Route
router.get("/sales-report", getSales);

// ✅ Products Route
router.get("/products-report", getProducts);

// ✅ Orders Route
router.get("/orders-report", getOrders);

// ✅ Employees Route
router.get("/employees", getEmployees);

// ✅ Return Sales Route
router.get("/return-sales-report", getReturnSales);

// ✅ Deliveries Route
router.get("/deliveries-report", getDeliveries);

export default router;
