import express from "express";
import { createOrder } from "../../controller/CheckoutController/CheckoutController.js";

const router = express.Router();

router.post("/add", createOrder);

export default router;
