import db from "../../config/db.js";
import path from "path";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Get active employees for dropdown (id + name only)
// 🔹 Get active and non-archived employees (including position) for dropdown
export const getEmployees = (req, res) => {
  const sql = `
  SELECT id, name, position, isActive, is_archived
  FROM employee
  WHERE is_archived = 0
  ORDER BY name ASC
`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Error fetching employees:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(result);
  });
};

// 🔹 Get all employee (full details)
export const getAllEmployee = (req, res) => {
  const sql = "SELECT * FROM employee WHERE is_archived=0 ORDER BY id ASC"; // 👈 Ascending order

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Error fetching all employee:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(result);
  });
};

// 🔹 Get employee image by ID
export const getEmployeeImage = (req, res) => {
  const employeeId = req.params.id;

  const sql = `
    SELECT r.image 
    FROM employee e 
    JOIN register r ON e.id = r.employee_id 
    WHERE e.id = ?
  `;

  db.query(sql, [employeeId], (err, result) => {
    if (err) {
      console.error("❌ SQL Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (!result.length || !result[0].image) {
      return res.status(404).json({ message: "Image not found" });
    }

    const imageRelativePath = result[0].image;
    const imagePath = path.join(process.cwd(), imageRelativePath);

    res.sendFile(imagePath, (err) => {
      if (err) {
        console.error("❌ SendFile error:", err);
        res.status(500).send("Failed to send image");
      }
    });
  });
};

// Add new employee
export const addEmployee = async (req, res) => {
  const { name, birthday, position, isActive, address, contact, email, role } =
    req.body;

  try {
    // 🔎 Check if employee name already exists
    const checkNameSQL =
      "SELECT COUNT(*) AS count FROM employee WHERE name = ?";
    db.query(checkNameSQL, [name], async (err, result) => {
      if (err) {
        console.error("❌ Error checking duplicate name:", err);
        return res
          .status(500)
          .json({ message: "Database error during name check" });
      }

      if (result[0].count > 0) {
        return res
          .status(400)
          .json({ message: "⚠️ Employee with this name already exists" });
      }

      // ✅ Proceed with insertion
      const insertEmployeeSQL = `
        INSERT INTO employee 
        (name, birthday, position, isActive, address, contact, email, role, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const employeeValues = [
        name,
        birthday,
        position,
        isActive ?? 1,
        address,
        contact,
        email,
        role ?? "User",
      ];

      db.query(insertEmployeeSQL, employeeValues, async (err, result) => {
        if (err) {
          console.error("❌ Error inserting employee:", err);
          return res.status(500).json({ message: "Database error" });
        }

        const employeeId = result.insertId;

        // 👇 Generate username and password
        const birth = new Date(birthday);
        const month = birth
          .toLocaleString("default", { month: "short" })
          .toLowerCase();
        const day = birth.getDate().toString().padStart(2, "0");
        const year = birth.getFullYear();

        let baseUsername = name.replace(/\s+/g, "").toLowerCase() + day;
        let username = baseUsername;
        let suffix = 1;

        // ✅ Check for duplicate usernames
        const checkUsernameExists = async (uname) => {
          return new Promise((resolve, reject) => {
            db.query(
              "SELECT COUNT(*) AS count FROM register WHERE username = ?",
              [uname],
              (err, results) => {
                if (err) reject(err);
                else resolve(results[0].count > 0);
              }
            );
          });
        };

        while (await checkUsernameExists(username)) {
          username = `${baseUsername}${suffix++}`;
        }

        const rawPassword = month + year;
        const hashedPassword = await bcryptjs.hash(rawPassword, 10);

        const insertRegisterSQL = `
          INSERT INTO register (employee_id, username, password, role, created_at)
          VALUES (?, ?, ?, ?, NOW())
        `;

        db.query(
          insertRegisterSQL,
          [employeeId, username, hashedPassword, role ?? "User"],
          async (regErr) => {
            if (regErr) {
              console.error("❌ Error inserting login:", regErr);
              return res
                .status(500)
                .json({ message: "Register table insert failed" });
            }

            // ✅ Send Email
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
              tls: { rejectUnauthorized: false },
            });

            const mailOptions = {
              from: `"HR Department" <${process.env.EMAIL_USER}>`,
              to: email,
              subject: "Welcome to the Company",
              html: `
                <p>Good day Mr./Ms. <strong>${name}</strong>,</p>
                <p>Your account has been successfully created.</p>
                <p><strong>Username:</strong> ${username}</p>
                <p><strong>Password:</strong> ${rawPassword}</p>
                <p>Please keep this information secure.</p>
                <br>
                <p>Thank you,</p>
                <p><em>HR Department</em></p>
              `,
            };

            try {
              await transporter.sendMail(mailOptions);
              console.log(`📧 Email sent to ${email}`);
              res.status(200).json({
                message: "✅ Employee and account created successfully",
                username,
                password: rawPassword,
                emailSent: true,
              });
            } catch (emailErr) {
              console.error("❌ Error sending email:", emailErr);
              res.status(200).json({
                message: "✅ Employee created, but failed to send email",
                username,
                password: rawPassword,
                emailSent: false,
              });
            }
          }
        );
      });
    });
  } catch (err) {
    console.error("❌ Unexpected error:", err.message);
    res.status(500).json({ message: "Unexpected server error" });
  }
};

// Update employee by ID
export const updateEmployeeById = (req, res) => {
  const { id } = req.params;
  const { name, birthday, position, isActive, address, contact, email, role } =
    req.body;

  const sql = `
    UPDATE employee 
    SET name = ?, birthday = ?, position = ?, isActive = ?, address = ?, contact = ?, email = ?, role = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name, birthday, position, isActive, address, contact, email, role, id],
    (err, result) => {
      if (err) {
        console.error("❌ Error updating employee:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.status(200).json({ message: "✅ Employee updated successfully" });
    }
  );
};

//archiving employee
export const archiveEmployee = (req, res) => {
  const id = req.params.id;

  const selectQuery = "SELECT * FROM employee WHERE id = ?";
  db.query(selectQuery, [id], (err, result) => {
    if (err) {
      console.error("❌ Error fetching employee:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const employee = result[0];

    const insertQuery = `
      REPLACE INTO archived_employee 
      (id, name, birthday, position, isActive, address, contact, email, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      employee.id,
      employee.name,
      employee.birthday,
      employee.position,
      employee.isActive,
      employee.address,
      employee.contact,
      employee.email,
      employee.role,
      employee.created_at,
    ];

    db.query(insertQuery, values, (err) => {
      if (err) {
        console.error("❌ Error archiving employee:", err);
        return res.status(500).json({ error: "Error archiving employee" });
      }

      const deleteQuery = "DELETE FROM employee WHERE id = ?";
      db.query(deleteQuery, [id], (err) => {
        if (err) {
          console.error("❌ Error deleting employee:", err);
          return res.status(500).json({ error: "Error deleting employee" });
        }

        res.status(200).json({ message: "✅ Employee archived successfully" });
      });
    });
  });
};
