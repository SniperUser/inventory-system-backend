// snackController.js
import db from "../../../admin/backend/config/db.js";

// Fetch all products in the "Snacks" category
export const getSnacks = (req, res) => {
  const sql = "SELECT * FROM product_stock WHERE category = ?";
  db.query(sql, ["Snacks"], (err, results) => {
    if (err) {
      console.error("Error fetching snacks:", err);
      return res.status(500).json({ error: "Failed to fetch snacks" });
    }
    res.json(results);
  });
};
