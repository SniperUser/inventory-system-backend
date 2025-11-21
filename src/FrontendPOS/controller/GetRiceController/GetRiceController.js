// riceController.js
import db from "../../../admin/backend/config/db.js";

// Fetch all products in the "Rice" category
export const getRice = (req, res) => {
  const sql = "SELECT * FROM product_stock WHERE category = ?";
  db.query(sql, ["Rice"], (err, results) => {
    if (err) {
      console.error("Error fetching rice products:", err);
      return res.status(500).json({ error: "Failed to fetch rice products" });
    }
    res.json(results);
  });
};
