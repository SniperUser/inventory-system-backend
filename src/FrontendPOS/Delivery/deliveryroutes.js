import express from "express";
import multer from "multer";
import path from "path";
import {
  getDeliveries,
  updatePaymentStatus,
  verifyDeliveryUser,
  updateProfile,
  changePassword,
  updateDeliveryStatus,
  updateDeliveryStatusWithReason,
  markDelivered,
} from "./deliverycontroller.js";

const router = express.Router();

// ✅ Setup Multer storage (for profile image uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // save in /uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // avoid name collisions
  },
});
const upload = multer({ storage });

// ✅ GET all deliveries
router.get("/get", getDeliveries);

// ✅ PUT update payment status
router.put("/payment-status", updatePaymentStatus);

// ✅ POST verifying user
router.post("/verify-user", verifyDeliveryUser);

// ✅ PUT update profile (with image upload)
router.put("/update/profile", upload.single("image"), updateProfile);

// ✅ PUT change password (JSON only)
router.put("/update/change-password", changePassword);

// ✅ PUT update delivery status
router.put("/update/delivery-status", updateDeliveryStatus);

// ✅ PUT update delivery status with reason (for not delivered)
router.put("/update/delivery-status-reason", updateDeliveryStatusWithReason);

// ✅ PUT mark as delivered
router.post("/mark-delivered", markDelivered);

export default router;
