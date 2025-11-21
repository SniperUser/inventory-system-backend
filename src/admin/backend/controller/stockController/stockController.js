import fs from "fs";
import path from "path";
import db from "../../config/db.js";

// 🔹 Add new stock
// 🔹 Add new stock (with image)
export const addStock = (req, res) => {
  try {
    if (!req.body) {
      console.error("❌ No request body");
      return res.status(400).json({ message: "Missing stock data" });
    }

    const {
      product_name,
      description,
      price,
      quantity,
      category,
      brand, // <-- Added
      supplier_id,
      received_by,
      received_date,
      product_condition,
    } = req.body;

    const image = req.file ? req.file.filename : null;

    console.log("📦 Incoming stock data:", req.body);
    console.log("🖼 Uploaded file: ", req.file);

    const sql = `
      INSERT INTO product_stock 
      (product_name, description, price, quantity, category, brand, supplier_id, received_by, received_date, product_condition, image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        product_name,
        description,
        price,
        quantity,
        category,
        brand, // <-- Added
        supplier_id,
        received_by,
        received_date,
        product_condition,
        image,
      ],
      (err, result) => {
        if (err) {
          console.error("❌ Error inserting stock:", err);
          return res.status(500).json({ message: "Database error" });
        }
        res.status(200).json({ message: "✅ Stock added successfully" });
      }
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔹 Update stock by ID (replace image if new one uploaded)
export const updateStockById = (req, res) => {
  const { id } = req.params;
  const {
    product_name,
    description,
    price,
    quantity,
    category,
    brand, // <-- Added
    supplier_id,
    received_by,
    received_date,
    product_condition,
  } = req.body;

  const newImage = req.file ? req.file.filename : null;

  // Fetch existing image from DB
  db.query(
    "SELECT image FROM product_stock WHERE id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error("❌ Error fetching image:", err);
        return res.status(500).json({ message: "Database error" });
      }

      const oldImage = rows[0]?.image;

      const sql = `
        UPDATE product_stock 
        SET product_name = ?, description = ?, price = ?, quantity = ?, category = ?, brand = ?, supplier_id = ?, 
            received_by = ?, received_date = ?, product_condition = ?, image = ?
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
          brand, // <-- Added
          supplier_id,
          received_by,
          received_date,
          product_condition,
          newImage || oldImage,
          id,
        ],
        (err, result) => {
          if (err) {
            console.error("❌ Error updating stock:", err);
            return res.status(500).json({ message: "Database error" });
          }

          // Delete old image from disk if new one is uploaded
          if (newImage && oldImage) {
            const imagePath = path.resolve("uploads", oldImage);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }

          res.status(200).json({ message: "✅ Stock updated successfully" });
        }
      );
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
// 🔹 Archive stock (move with image)
export const archiveStock = (req, res) => {
  const id = req.params.id;

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

    const insertQuery = `
      REPLACE INTO archived_stock 
      (id, product_name, description, price, quantity, category, brand, supplier_id, created_at, received_by, received_date, image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      stock.id,
      stock.product_name,
      stock.description,
      stock.price,
      stock.quantity,
      stock.category,
      stock.brand, // <-- Added
      stock.supplier_id,
      stock.created_at,
      stock.received_by,
      stock.received_date,
      stock.image,
    ];

    db.query(insertQuery, values, (err) => {
      if (err) {
        console.error("❌ Error archiving stock:", err);
        return res.status(500).json({ error: "Error inserting into archive" });
      }

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
