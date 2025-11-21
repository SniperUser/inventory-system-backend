import db from "../../../admin/backend/config/db.js";
import path from "path";
import bcrypt from "bcryptjs";
import multer from "multer"; // ✅ for image uploads
import fs from "fs";

// Helper to wrap db.query in a Promise
const queryAsync = (sql, params) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

// Base URL for serving images
const baseURL = process.env.BASE_URL || "http://localhost:5000";

/* -------------------- MULTER CONFIG -------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // ✅ Keep original filename (preserve spaces)
    const originalName = file.originalname.replace(/\s+/g, " ");
    cb(null, `${Date.now()}-${originalName}`);
  },
});
export const upload = multer({ storage });

/* -------------------- GET USER -------------------- */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "User ID is required" });

    const rows = await queryAsync(
      `SELECT 
          e.id AS employee_id,
          e.name,
          e.address,
          e.contact,
          e.email,
          e.role AS employee_role,
          e.position,
          e.birthday,
          r.username,
          r.password,
          r.role AS account_role,
          r.image
       FROM employee e
       INNER JOIN register r ON e.id = r.employee_id
       WHERE e.id = ?`,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = { ...rows[0] };

    // Send full URL for image
    if (user.image) {
      // if old records only contain filename, normalize it
      const imagePath = user.image.startsWith("uploads/")
        ? user.image
        : `uploads/${user.image}`;

      const filename = path.basename(imagePath);
      user.image = `${baseURL}/uploads/${encodeURIComponent(filename)}`;
    } else {
      user.image = null;
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------- VERIFY PASSWORD -------------------- */
export const verifyPassword = async (req, res) => {
  try {
    const { employee_id, password } = req.body;

    if (!employee_id || !password) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and password are required",
      });
    }

    // Get hashed password from register table
    const rows = await queryAsync(
      "SELECT password FROM register WHERE employee_id = ?",
      [employee_id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    res.json({ success: true, message: "Password verified" });
  } catch (error) {
    console.error("❌ Error verifying password:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- UPDATE PROFILE -------------------- */
export const updateProfile = async (req, res) => {
  try {
    const {
      employee_id,
      username,
      name,
      address,
      contact,
      email,
      birthday,
      oldPassword,
      newPassword,
    } = req.body;

    if (!employee_id) {
      return res.status(400).json({ message: "Employee ID required" });
    }

    const users = await queryAsync(
      "SELECT * FROM register WHERE employee_id = ?",
      [employee_id]
    );
    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    let hashedPassword = user.password;
    if (newPassword) {
      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    // Update employee details
    await queryAsync(
      "UPDATE employee SET name = ?, address = ?, contact = ?, email = ?, birthday = ? WHERE id = ?",
      [name, address, contact, email, birthday, employee_id]
    );

    // ✅ If image uploaded, save full path (uploads/filename)
    if (req.file) {
      const imagePath = `uploads/${req.file.filename}`;
      await queryAsync("UPDATE register SET image = ? WHERE employee_id = ?", [
        imagePath,
        employee_id,
      ]);
    }

    // Update username/password
    await queryAsync(
      "UPDATE register SET username = ?, password = ? WHERE employee_id = ?",
      [username, hashedPassword, employee_id]
    );

    res.json({
      message: "Profile updated successfully",
      updatedImage: req.file
        ? `${baseURL}/uploads/${encodeURIComponent(req.file.filename)}`
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------- UPLOAD IMAGE -------------------- */
export const uploadImage = async (req, res) => {
  try {
    const { employee_id } = req.body;
    if (!employee_id)
      return res.status(400).json({ message: "Employee ID required" });

    if (!req.file)
      return res.status(400).json({ message: "No image file uploaded" });

    // ✅ Store as "uploads/filename"
    const imagePath = `uploads/${req.file.filename}`;

    // Update DB record
    await queryAsync("UPDATE register SET image = ? WHERE employee_id = ?", [
      imagePath,
      employee_id,
    ]);

    res.json({
      message: "Image uploaded successfully",
      imageUrl: `${baseURL}/${imagePath}`,
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
