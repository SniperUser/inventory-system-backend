import bcryptjs from "bcryptjs";
import db from "../config/db.js";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    db.query(
      `SELECT r.*, e.id AS employee_id, e.name, e.address, e.contact, e.email, e.position, 
              DATE_FORMAT(e.birthday, '%Y-%m-%d') AS birthday, e.role AS employee_role
       FROM register r
       LEFT JOIN employee e ON r.employee_id = e.id
       WHERE r.username = ?`,
      [username],
      async (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Internal database error" });
        }

        if (!results || results.length === 0) {
          return res
            .status(401)
            .json({ message: "Invalid username or password" });
        }

        const user = results[0];
        const isMatch = await bcryptjs.compare(password, user.password);

        if (!isMatch) {
          return res
            .status(401)
            .json({ message: "Invalid username or password" });
        }

        // ✅ Update isActive = true in the database
        db.query(
          "UPDATE employee SET isActive = ? WHERE id = ?",
          [true, user.employee_id],
          (updateErr) => {
            if (updateErr) {
              console.error("Failed to update active status:", updateErr);
              return res.status(500).json({
                message: "Login succeeded, but failed to set active status",
              });
            }

            const userPayload = {
              id: user.id, // register ID
              employee_id: user.employee_id, // from employee table
              username: user.username,
              name: user.name,
              lastname: user.lastname,
              email: user.email,
              address: user.address,
              contact: user.contact,
              role: user.role || user.employee_role,
              position: user.position,
              birthday: user.birthday,
            };

            const token = jwt.sign(
              userPayload,
              process.env.JWT_SECRET || "devsecret",
              {
                expiresIn: "1h",
              }
            );

            return res.status(200).json({
              success: true,
              message: "Login successful",
              user: userPayload,
              token,
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

//logout user
export const logoutUser = (req, res) => {
  const { employee_id } = req.body;

  if (!employee_id) {
    return res.status(400).json({ message: "Employee ID is required" });
  }

  const sql = `UPDATE employee SET isActive = ? WHERE id = ?`;

  db.query(sql, [false, employee_id], (err, result) => {
    if (err) {
      console.error("❌ Error updating employee status on logout:", err);
      return res.status(500).json({ message: "Failed to logout user" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ message: "✅ User logged out successfully" });
  });
};

// 🔹 Update employee status (active/inactive)
// 🔹 Update employee status (active/inactive)
export const updateEmployeeStatus = (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ message: "Invalid 'isActive' value" });
  }

  const sql = `UPDATE employee SET isActive = ? WHERE id = ?`;

  db.query(sql, [isActive, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating employee status:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ message: "✅ Employee status updated" });
  });
};

//get profile of login user
export const getUserProfile = (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT 
  r.id AS register_id,
  r.employee_id,
  r.username,
  r.password,
  r.role,
  r.image,
  e.name,
  e.address,
  e.contact,
  e.email,
  DATE_FORMAT(e.birthday, '%Y-%m-%d') AS birthday,  -- ✅ Ensures correct format
  e.position,
  e.role AS employee_role
FROM register r
LEFT JOIN employee e ON r.employee_id = e.id
WHERE r.id = ?
`;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results[0]);
  });
};

//upload image
//upload image
export const registerWithImage = async (req, res) => {
  const { employee_id, username, password, role } = req.body;
  const image = req.file ? req.file.path.replace(/\\/g, "/") : null;

  if (!employee_id || !username || !password || !role || !image) {
    return res
      .status(400)
      .json({ message: "All fields including image are required" });
  }

  try {
    let hashedPassword;

    if (password && !password.startsWith("$2")) {
      hashedPassword = await bcryptjs.hash(password, 10);
    } else {
      hashedPassword = password; // already hashed
    }

    // Delete any existing user with the same username
    db.query(
      "DELETE FROM register WHERE username = ?",
      [username],
      (deleteErr) => {
        if (deleteErr) {
          console.error("Error deleting existing user:", deleteErr);
          return res
            .status(500)
            .json({ message: "Failed to delete existing user" });
        }

        // Now insert the new user
        const sql = `
        INSERT INTO register (employee_id, username, password, role, image, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;

        db.query(
          sql,
          [employee_id, username, hashedPassword, role, image],
          (err, result) => {
            if (err) {
              console.error("Error inserting user:", err);
              return res
                .status(500)
                .json({ message: "Database error during insert" });
            }

            return res
              .status(201)
              .json({ success: true, message: "User registered successfully" });
          }
        );
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return res
      .status(500)
      .json({ message: "Server error during registration" });
  }
};

//update image
// Add to authController.js
// Update profile (employee + register)
export const updateProfile = async (req, res) => {
  const { employee_id, username, name, address, contact, email, birthday } =
    req.body;

  const image = req.file ? req.file.path.replace(/\\/g, "/") : null;

  // Validate required fields
  if (
    !employee_id ||
    !username ||
    !name ||
    !address ||
    !contact ||
    !email ||
    !birthday
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 1️⃣ Update employee table
    const employeeSql = `
      UPDATE employee
      SET name = ?, address = ?, contact = ?, email = ?, birthday = ?
      WHERE id = ?
    `;

    db.query(
      employeeSql,
      [name, address, contact, email, birthday, employee_id],
      (employeeErr, employeeResult) => {
        if (employeeErr) {
          console.error("Employee update error:", employeeErr);
          return res
            .status(500)
            .json({ message: "Failed to update employee info" });
        }

        if (employeeResult.affectedRows === 0) {
          return res.status(404).json({ message: "Employee not found" });
        }

        // 2️⃣ Update register table
        let registerSql = `UPDATE register SET username = ?`;
        const params = [username];

        if (image) {
          registerSql += `, image = ?`;
          params.push(image);
        }

        registerSql += ` WHERE employee_id = ?`;
        params.push(employee_id);

        db.query(registerSql, params, (registerErr, registerResult) => {
          if (registerErr) {
            console.error("Register update error:", registerErr);
            return res.status(500).json({
              message: "Employee updated, but failed to update register info",
            });
          }

          if (registerResult.affectedRows === 0) {
            return res.status(404).json({
              message: "Register record not found for this employee",
            });
          }

          // ✅ Both tables updated successfully
          return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            updatedImage: image || null,
          });
        });
      }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return res
      .status(500)
      .json({ message: "Server error during profile update" });
  }
};

//update password in modal pos
export const changePassword = async (req, res) => {
  console.log("🔐 Received change-password request:", req.body);

  const { userId, oldPassword, newPassword } = req.body;

  if (!userId || !oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    db.query(
      "SELECT password FROM register WHERE id = ?",
      [userId],
      async (err, results) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Database error" });

        if (!results.length) {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }

        const isMatch = await bcryptjs.compare(
          oldPassword,
          results[0].password
        );
        if (!isMatch) {
          return res
            .status(401)
            .json({ success: false, message: "Old password is incorrect" });
        }

        const hashedNewPassword = await bcryptjs.hash(newPassword, 10);
        db.query(
          "UPDATE register SET password = ? WHERE id = ?",
          [hashedNewPassword, userId],
          (updateErr) => {
            if (updateErr) {
              return res
                .status(500)
                .json({ success: false, message: "Failed to update password" });
            }
            return res.status(200).json({
              success: true,
              message: "Password updated successfully",
            });
          }
        );
      }
    );
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

//update password in cashier modal
export const cashierChangePassword = async (req, res) => {
  console.log("🔐 Cashier change-password request:", req.body);

  const { employee_id, oldPassword, newPassword } = req.body;

  if (!employee_id || !oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    // 1️⃣ Fetch current password
    db.query(
      "SELECT password FROM register WHERE employee_id = ?",
      [employee_id],
      async (err, results) => {
        if (err) {
          console.error("❌ DB error:", err);
          return res
            .status(500)
            .json({ success: false, message: "Database error" });
        }

        if (!results.length) {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }

        const storedPassword = results[0].password;

        // 2️⃣ Compare old password
        const isMatch = await bcryptjs.compare(oldPassword, storedPassword);
        if (!isMatch) {
          return res
            .status(401)
            .json({ success: false, message: "Old password is incorrect" });
        }

        // 3️⃣ Hash new password
        const hashedNewPassword = await bcryptjs.hash(newPassword, 10);

        // 4️⃣ Update DB
        db.query(
          "UPDATE register SET password = ? WHERE employee_id = ?",
          [hashedNewPassword, employee_id],
          (updateErr) => {
            if (updateErr) {
              console.error("❌ Password update failed:", updateErr);
              return res.status(500).json({
                success: false,
                message: "Failed to update password",
              });
            }

            return res.status(200).json({
              success: true,
              message: "✅ Password updated successfully",
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("❌ Server error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

//join the 2 table in  the db to display the user login page  from the database to login page dashbioard
// controller-only: getLoggedInUsers
export const getLoggedInUsers = (req, res) => {
  const sql = `
    SELECT 
      e.id,
      e.name AS full_name,
      r.username,
      e.email,
      IFNULL(r.role, e.role) AS role,
      CASE WHEN e.isActive THEN 'active' ELSE 'inactive' END AS status,
      e.created_at AS login_time,
      r.image
    FROM employee e
    LEFT JOIN register r ON r.employee_id = e.id
    WHERE e.is_archived = 0
      AND e.isActive = 1
    ORDER BY e.name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching active logged-in users:", err);
      return res.status(500).json({ message: "Server error" });
    }

    const sanitized = results.map((u) => ({
      ...u,
      password: "••••••",
      image: u.image ? u.image.replace(/\\/g, "/") : null,
    }));

    return res.status(200).json(sanitized);
  });
};

// Get the currently authenticated (active) user
export const getCurrentActiveUser = (req, res) => {
  const { employee_id } = req.user; // comes from verifyToken middleware

  if (!employee_id) {
    return res
      .status(400)
      .json({ message: "Invalid token or missing employee_id" });
  }

  const sql = `
    SELECT 
      e.id,
      e.name AS full_name,
      r.username,
      e.email,
      IFNULL(r.role, e.role) AS role,
      CASE WHEN e.isActive THEN 'active' ELSE 'inactive' END AS status,
      e.created_at AS login_time,
      r.image
    FROM employee e
    LEFT JOIN register r ON r.employee_id = e.id
    WHERE e.id = ?
      AND e.isActive = 1
      AND e.is_archived = 0
    LIMIT 1
  `;

  db.query(sql, [employee_id], (err, results) => {
    if (err) {
      console.error("Error fetching current active user:", err);
      return res.status(500).json({ message: "Server error" });
    }
    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Active user not found" });
    }

    const user = {
      ...results[0],
      password: "••••••",
      image: results[0].image ? results[0].image.replace(/\\/g, "/") : null,
    };

    return res.status(200).json(user);
  });
};

// Controller: get all registered users with employee info to display in register page dashboard
export const getAllRegisteredUsers = (req, res) => {
  const sql = `
    SELECT
      r.id AS register_id,
      r.employee_id,
      r.username,
      r.role AS register_role,
      r.image,
      DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i:%s') AS registered_at,
      e.name,
      e.isActive,
      e.address,
      e.contact,
      e.email,
      e.role AS employee_role,
      e.position,
      DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s') AS employee_created_at,
      DATE_FORMAT(e.birthday, '%Y-%m-%d') AS birthday,
      e.is_archived
    FROM register r
    LEFT JOIN employee e ON r.employee_id = e.id
    ORDER BY e.name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching registered users:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    // Optionally sanitize or transform data here before sending
    const sanitized = results.map((user) => ({
      register_id: user.register_id,
      employee_id: user.employee_id,
      username: user.username,
      role: user.register_role || user.employee_role,
      image: user.image ? user.image.replace(/\\/g, "/") : null,
      registered_at: user.registered_at,
      name: user.name,
      isActive: user.isActive,
      address: user.address,
      contact: user.contact,
      email: user.email,
      position: user.position,
      birthday: user.birthday,
      is_archived: user.is_archived,
    }));

    return res.status(200).json(sanitized);
  });
};
