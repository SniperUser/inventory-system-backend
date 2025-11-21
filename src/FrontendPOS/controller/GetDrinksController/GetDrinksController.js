// drinkController.js
import db from "../../../admin/backend/config/db.js";

// Fetch all products in the "Drinks" category
export const getDrinks = (req, res) => {
  const sql = "SELECT * FROM product_stock WHERE category = ?";
  db.query(sql, ["Drinks"], (err, results) => {
    if (err) {
      console.error("Error fetching drinks:", err);
      return res.status(500).json({ error: "Failed to fetch drinks" });
    }
    res.json(results);
  });
};
