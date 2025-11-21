import bcrypt from "bcryptjs";
import db from "../config/db.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Add new stock
export const addStock = (req, res) => {
  const {
    product_name,
    description,
    price,
    quantity,
    category,
    supplier_id,
    received_by,
    received_date,
    product_condition,
  } = req.body;

  const sql = `
    INSERT INTO product_stock 
    (product_name, description, price, quantity, category, supplier_id, received_by, received_date, product_condition) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      product_name,
      description,
      price,
      quantity,
      category,
      supplier_id,
      received_by,
      received_date,
      product_condition,
    ],
    (err, result) => {
      if (err) {
        console.error("❌ Error inserting stock:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.status(200).json({ message: "✅ Stock added successfully" });
    }
  );
};

// 🔹 Update product stock by ID
export const updateStockById = (req, res) => {
  const { id } = req.params;
  const {
    product_name,
    description,
    price,
    quantity,
    category,
    supplier_id,
    received_by,
    received_date,
    product_condition,
  } = req.body;

  const sql = `
    UPDATE product_stock 
    SET product_name = ?, description = ?, price = ?, quantity = ?, category = ?, supplier_id = ?, 
        received_by = ?, received_date = ?, product_condition = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      product_name,
      description,
      price,
      quantity,
      category,
      supplier_id,
      received_by,
      received_date,
      product_condition,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("❌ Error updating product stock:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Stock not found" });
      }

      res.status(200).json({ message: "✅ Stock updated successfully" });
    }
  );
};

// 🔹 Get all stock records
export const getStock = (req, res) => {
  db.query("SELECT * FROM product_stock ORDER BY id ASC", (err, result) => {
    if (err) {
      console.error("❌ Error fetching stock:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(result);
  });
};

// 🔹 Delete stock by ID
// 🔹 Archive stock instead of deleting
export const archiveStock = (req, res) => {
  const id = req.params.id;

  // Step 1: Get the stock data
  const selectQuery = "SELECT * FROM product_stock WHERE id = ?";
  db.query(selectQuery, [id], (err, result) => {
    if (err) {
      console.error("❌ Error selecting stock:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Stock item not found" });
    }

    const stock = result[0];

    // Step 2: Insert into archived_stock (include received_by and received_date)
    const insertQuery = `
      REPLACE INTO archived_stock 
      (id, product_name, description, price, quantity, category, supplier_id, created_at, received_by, received_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      stock.id,
      stock.product_name,
      stock.description,
      stock.price,
      stock.quantity,
      stock.category,
      stock.supplier_id,
      stock.created_at,
      stock.received_by, // ✅ New field
      stock.received_date, // ✅ New field
    ];

    db.query(insertQuery, values, (err) => {
      if (err) {
        console.error("❌ Error archiving stock:", err);
        return res.status(500).json({ error: "Error inserting into archive" });
      }

      // Step 3: Delete from original table
      const deleteQuery = "DELETE FROM product_stock WHERE id = ?";
      db.query(deleteQuery, [id], (err) => {
        if (err) {
          console.error("❌ Error deleting stock:", err);
          return res.status(500).json({ error: "Error deleting stock" });
        }

        res.status(200).json({ message: "✅ Stock archived successfully" });
      });
    });
  });
};

// GET archived stock
export const getArchivedStock = (req, res) => {
  const sql = "SELECT * FROM archived_stock";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching archived stock:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
};

// 🔹 Get suppliers for dropdown (id + name only)
export const getSuppliers = (req, res) => {
  const sql = "SELECT id, name FROM supplier ORDER BY name ASC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Error fetching suppliers:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(result);
  });
};

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

// 🔹 Add a new supplier
export const addSupplier = (req, res) => {
  const { product, name, contact, phone, address } = req.body;

  const sql = `
    INSERT INTO supplier (product, name, contact, phone, address)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [product, name, contact, phone, address], (err, result) => {
    if (err) {
      console.error("❌ Error inserting supplier:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const newId = result.insertId;
    res
      .status(200)
      .json({ message: "✅ Supplier added successfully", id: newId });
  });
};

// 🔹 Get all suppliers (full details)
export const getAllSuppliers = (req, res) => {
  const sql = "SELECT * FROM supplier ORDER BY id ASC"; // 👈 Ascending order

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Error fetching all suppliers:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(result);
  });
};

// 🔹 Delete supplier by ID
export const deleteSupplierById = (req, res) => {
  const id = req.params.id;

  // First, get the supplier data
  const selectQuery = "SELECT * FROM supplier WHERE id = ?";
  db.query(selectQuery, [id], (err, result) => {
    if (err || result.length === 0) {
      return res
        .status(500)
        .json({ message: "Error finding supplier to archive" });
    }

    const supplier = result[0];

    // Insert into archived_data
    const insertQuery = `
      INSERT INTO archived (type, reference_id, name, position, isActive, address, contact, email, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      "supplier",
      supplier.id,
      supplier.name,
      supplier.product, // using product in place of position
      1, // assuming isActive = 1 by default
      supplier.address,
      supplier.contact,
      supplier.phone, // using phone as email
      null, // role is null
      supplier.created_at,
    ];

    db.query(insertQuery, values, (err) => {
      if (err)
        return res.status(500).json({ message: "Error archiving supplier" });

      // Then delete from suppliers table
      const deleteQuery = "DELETE FROM supplier WHERE id = ?";
      db.query(deleteQuery, [id], (err) => {
        if (err)
          return res.status(500).json({ message: "Error deleting supplier" });

        res.json({ message: "Supplier archived successfully" });
      });
    });
  });
};

// 🔹 Update supplier by ID
export const updateSupplierById = (req, res) => {
  const { id } = req.params;
  const { product, name, contact, phone, address } = req.body;

  const sql = `
    UPDATE supplier 
    SET product = ?, name = ?, contact = ?, phone = ?, address = ?
    WHERE id = ?
  `;

  db.query(sql, [product, name, contact, phone, address, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating supplier:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json({ message: "✅ Supplier updated successfully" });
  });
};

// 🔹 Archive supplier by ID instead deleting
export const archiveSupplier = (req, res) => {
  const id = req.params.id;

  // Step 1: Fetch the supplier by ID
  const selectQuery = "SELECT * FROM supplier WHERE id = ?";
  db.query(selectQuery, [id], (err, result) => {
    if (err) {
      console.error("❌ Error selecting supplier:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const supplier = result[0];

    // Step 2: Archive into archived_supplier
    const insertQuery = `
      REPLACE INTO archived_supplier 
      (id, name, address, contact, created_at) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
      supplier.id,
      supplier.name,
      supplier.address,
      supplier.contact,
      supplier.created_at,
    ];

    db.query(insertQuery, values, (err) => {
      if (err) {
        console.error("❌ Error archiving supplier:", err);
        return res.status(500).json({ error: "Error inserting into archive" });
      }

      // Step 3: Delete original supplier
      const deleteQuery = "DELETE FROM supplier WHERE id = ?";
      db.query(deleteQuery, [id], (err) => {
        if (err) {
          console.error("❌ Error deleting supplier:", err);
          return res.status(500).json({ error: "Error deleting supplier" });
        }

        res.status(200).json({ message: "✅ Supplier archived successfully" });
      });
    });
  });
};

// 🔹 Get all archived suppliers
export const getArchivedSuppliers = (req, res) => {
  const sql = `
    SELECT id, name, address, contact, created_at 
    FROM archived_supplier
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Error fetching archived suppliers:", err);
      return res.status(500).json({ error: "Database error" });
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
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

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

//get the archived employee from the database
export const getArchivedEmployees = (req, res) => {
  const sql = `
    SELECT id, name, birthday, position, isActive, address, contact, email, role, created_at 
    FROM archived_employee
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Error fetching archived employees:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(result);
  });
};

//restore archived employee
export const restoreArchivedEmployee = (req, res) => {
  const id = req.params.id;

  const selectQuery = "SELECT * FROM archived_employee WHERE id = ?";
  db.query(selectQuery, [id], (err, results) => {
    if (err || results.length === 0) {
      console.error("❌ Error fetching archived employee:", err);
      return res.status(404).json({ error: "Archived employee not found" });
    }

    const emp = results[0];
    const insertQuery = `
      REPLACE INTO employee 
      (id, name, birthday, position, isActive, address, contact, email, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertQuery,
      [
        emp.id,
        emp.name,
        emp.birthday,
        emp.position,
        emp.isActive,
        emp.address,
        emp.contact,
        emp.email,
        emp.role,
        emp.created_at,
      ],
      (insertErr) => {
        if (insertErr) {
          console.error("❌ Error restoring employee:", insertErr);
          return res.status(500).json({ error: "Restore failed" });
        }

        db.query("DELETE FROM archived_employee WHERE id = ?", [id]);
        res.status(200).json({ message: "✅ Employee restored successfully" });
      }
    );
  });
};

//get archived suppliers
export const restoreArchivedSupplier = (req, res) => {
  const id = req.params.id;

  const selectQuery = "SELECT * FROM archived_supplier WHERE id = ?";
  db.query(selectQuery, [id], (err, results) => {
    if (err || results.length === 0) {
      console.error("❌ Error fetching archived supplier:", err);
      return res.status(404).json({ error: "Archived supplier not found" });
    }

    const sup = results[0];
    const insertQuery = `
      REPLACE INTO supplier 
      (id, name, address, contact, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      insertQuery,
      [sup.id, sup.name, sup.address, sup.contact, sup.created_at],
      (insertErr) => {
        if (insertErr) {
          console.error("❌ Error restoring supplier:", insertErr);
          return res.status(500).json({ error: "Restore failed" });
        }

        db.query("DELETE FROM archived_supplier WHERE id = ?", [id]);
        res.status(200).json({ message: "✅ Supplier restored successfully" });
      }
    );
  });
};

//get archived stock
export const restoreArchivedStock = (req, res) => {
  const id = req.params.id;

  const selectQuery = "SELECT * FROM archived_stock WHERE id = ?";
  db.query(selectQuery, [id], (err, results) => {
    if (err || results.length === 0) {
      console.error("❌ Error fetching archived stock:", err);
      return res.status(404).json({ error: "Archived stock not found" });
    }

    const stock = results[0];

    const insertQuery = `
      REPLACE INTO product_stock 
      (id, product_name, description, price, quantity, category, supplier_id, created_at, received_by, received_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      stock.id,
      stock.product_name,
      stock.description,
      stock.price,
      stock.quantity,
      stock.category,
      stock.supplier_id,
      stock.created_at,
      stock.received_by,
      stock.received_date,
    ];

    db.query(insertQuery, values, (insertErr) => {
      if (insertErr) {
        console.error("❌ Error restoring stock:", insertErr);
        return res.status(500).json({ error: "Restore failed" });
      }

      db.query("DELETE FROM archived_stock WHERE id = ?", [id], (deleteErr) => {
        if (deleteErr) {
          console.error("❌ Error deleting from archive:", deleteErr);
          return res.status(500).json({ error: "Cleanup failed" });
        }

        res.status(200).json({ message: "✅ Stock restored successfully" });
      });
    });
  });
};

//delete archived stock
export const deleteArchivedStock = (req, res) => {
  const id = req.params.id;

  const query = "DELETE FROM archived_stock WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting archived stock:", err);
      return res.status(500).json({ error: "Failed to delete archived stock" });
    }
    res.status(200).json({ message: "✅ Archived stock deleted successfully" });
  });
};

//delete archived employee
export const deleteArchivedEmployee = (req, res) => {
  const id = req.params.id;

  const query = "DELETE FROM archived_employee WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting archived employee:", err);
      return res
        .status(500)
        .json({ error: "Failed to delete archived employee" });
    }
    res
      .status(200)
      .json({ message: "✅ Archived employee deleted successfully" });
  });
};

//delete archived supplier
export const deleteArchivedSupplier = (req, res) => {
  const id = req.params.id;

  const query = "DELETE FROM archived_supplier WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting archived supplier:", err);
      return res
        .status(500)
        .json({ error: "Failed to delete archived supplier" });
    }
    res
      .status(200)
      .json({ message: "✅ Archived supplier deleted successfully" });
  });
};
