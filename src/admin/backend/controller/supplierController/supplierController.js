import db from "../../config/db.js";


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
    res.status(200).json({ message: "✅ Supplier added successfully", id: newId });
  });
};

// 🔹 Archive supplier by ID instead deleting
export const archiveSupplier = (req, res) => {
  const id = req.params.id;

  // Step 1: Fetch the supplier by ID
  const selectQuery = 'SELECT * FROM supplier WHERE id = ?';
  db.query(selectQuery, [id], (err, result) => {
    if (err) {
      console.error('❌ Error selecting supplier:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
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
        console.error('❌ Error archiving supplier:', err);
        return res.status(500).json({ error: 'Error inserting into archive' });
      }

      // Step 3: Delete original supplier
      const deleteQuery = 'DELETE FROM supplier WHERE id = ?';
      db.query(deleteQuery, [id], (err) => {
        if (err) {
          console.error('❌ Error deleting supplier:', err);
          return res.status(500).json({ error: 'Error deleting supplier' });
        }

        res.status(200).json({ message: '✅ Supplier archived successfully' });
      });
    });
  });
};

