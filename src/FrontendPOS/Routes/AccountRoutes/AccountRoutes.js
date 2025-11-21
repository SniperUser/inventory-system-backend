// src/backend/routes/userRoutes.js
import express from "express";
import {
  getUser,
  updateProfile,
  uploadImage,
  upload,
  verifyPassword,
} from "../../controller/AccountController/AccountController.js";

const router = express.Router();

// GET /api/users/:id
router.get("/getaccount/:id", getUser);
router.put("/updateProfile", upload.single("image"), updateProfile);
router.post("/uploadImage", upload.single("image"), uploadImage);
router.post("/verifyPassword", verifyPassword);

export default router;
