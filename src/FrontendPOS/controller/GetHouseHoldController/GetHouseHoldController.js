// householdController.js
import db from "../../../admin/backend/config/db.js";

// Fetch all products in the "Household Items" category
export const getHouseholdItems = (req, res) => {
  const sql = "SELECT * FROM product_stock WHERE category = ?";
  db.query(sql, ["Household Items"], (err, results) => {
    if (err) {
      console.error("Error fetching household items:", err);
      return res.status(500).json({ error: "Failed to fetch household items" });
    }
    res.json(results);
  });
};
