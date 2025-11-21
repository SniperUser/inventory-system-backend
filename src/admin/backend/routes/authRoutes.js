import express from "express";
import {
  loginUser,
  getUserProfile,
  registerWithImage,
  changePassword,
  updateProfile,
  updateEmployeeStatus,
  logoutUser,
  getLoggedInUsers,
  getCurrentActiveUser,
  getAllRegisteredUsers,
  cashierChangePassword,
} from "../controller/authController.js";

import upload from "../middleware/uploadimage.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login/user", loginUser);
router.get("/logged-in-users", getLoggedInUsers);
router.get("/me", verifyToken, getCurrentActiveUser);
router.get("/all-registered-users", getAllRegisteredUsers);
router.get("/profile/:id", getUserProfile);
router.post("/register-with-image", upload.single("image"), registerWithImage);

router.post("/update/profile", upload.single("image"), updateProfile);
router.post("/setActive/:id", updateEmployeeStatus);
router.post("/logout/user", logoutUser);

// ✅ Correct controller now connected to chanage pasword the modal user
router.post("/update/change-password", changePassword);
router.post("/update/cashier-change-password", cashierChangePassword);

export default router;
