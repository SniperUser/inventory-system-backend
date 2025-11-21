import express from "express";
import {
  getDeliveries,
  deleteDelivery,
  updateDeliveryStatus,
  getDeliveredDeliveries,
} from "../../controller/deliveryController/deliveryController.js";

const router = express.Router();

router.get("/get", getDeliveries);
router.delete("/:id", deleteDelivery);
router.put("/:id", updateDeliveryStatus);
router.get("/get-delivered", getDeliveredDeliveries);

export default router;
