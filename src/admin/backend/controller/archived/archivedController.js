import db from "../../config/db.js";

// ✅ Restore archived employee
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

        db.query(
          "DELETE FROM archived_employee WHERE id = ?",
          [id],
          (delErr) => {
            if (delErr) {
              console.error("❌ Error deleting archived employee:", delErr);
              return res.status(500).json({ error: "Cleanup failed" });
            }
            res
              .status(200)
              .json({ message: "✅ Employee restored successfully" });
          }
        );
      }
    );
  });
};

// ✅ Restore archived supplier
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

        db.query(
          "DELETE FROM archived_supplier WHERE id = ?",
          [id],
          (delErr) => {
            if (delErr) {
              console.error("❌ Error deleting archived supplier:", delErr);
              return res.status(500).json({ error: "Cleanup failed" });
            }
            res
              .status(200)
              .json({ message: "✅ Supplier restored successfully" });
          }
        );
      }
    );
  });
};

// ✅ Restore archived stock (includes brand now)
export const restoreArchivedStock = (req, res) => {
  const id = req.params.id;

  const selectQuery = "SELECT * FROM archived_stock WHERE id = ?";
  db.query(selectQuery, [id], (err, results) => {
    if (err) {
      console.error("❌ DB Error while fetching archived stock:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Archived stock not found" });
    }

    const stock = results[0];

    const insertQuery = `
      REPLACE INTO product_stock 
      (id, product_name, description, price, quantity, category, brand, supplier_id, created_at, received_by, received_date, product_condition, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      stock.id,
      stock.product_name,
      stock.description,
      stock.price,
      stock.quantity,
      stock.category,
      stock.brand, // ✅ Added brand field
      stock.supplier_id,
      stock.created_at,
      stock.received_by,
      stock.received_date,
      stock.product_condition || "New",
      stock.image || null,
    ];

    db.query(insertQuery, values, (insertErr) => {
      if (insertErr) {
        console.error("❌ Error inserting into product_stock:", insertErr);
        return res.status(500).json({ error: "Restore failed" });
      }

      const deleteQuery = "DELETE FROM archived_stock WHERE id = ?";
      db.query(deleteQuery, [id], (deleteErr) => {
        if (deleteErr) {
          console.error("❌ Error deleting from archived_stock:", deleteErr);
          return res.status(500).json({ error: "Cleanup failed" });
        }

        res.status(200).json({ message: "✅ Stock restored successfully" });
      });
    });
  });
};

// ❌ Permanently delete archived stock
export const deleteArchivedStock = (req, res) => {
  const id = req.params.id;

  const query = "DELETE FROM archived_stock WHERE id = ?";
  db.query(query, [id], (err) => {
    if (err) {
      console.error("❌ Error deleting archived stock:", err);
      return res.status(500).json({ error: "Failed to delete archived stock" });
    }

    res.status(200).json({ message: "✅ Archived stock deleted successfully" });
  });
};

// ❌ Delete archived employee
export const deleteArchivedEmployee = (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM archived_employee WHERE id = ?";
  db.query(query, [id], (err) => {
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

// ❌ Delete archived supplier
export const deleteArchivedSupplier = (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM archived_supplier WHERE id = ?";
  db.query(query, [id], (err) => {
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
