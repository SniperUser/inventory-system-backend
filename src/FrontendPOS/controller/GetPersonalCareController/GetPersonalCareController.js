// personalCareController.js
import db from "../../../admin/backend/config/db.js";

// Fetch all products in the "Personal Care" category
export const getPersonalCare = (req, res) => {
  const sql = "SELECT * FROM product_stock WHERE category = ?";
  db.query(sql, ["Personal Care"], (err, results) => {
    if (err) {
      console.error("Error fetching personal care products:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch personal care products" });
    }
    res.json(results);
  });
};
