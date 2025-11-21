// condimentsController.js
import db from "../../../admin/backend/config/db.js";

// Fetch all products in the "Condiments" category
export const getCondiments = (req, res) => {
  const sql = "SELECT * FROM product_stock WHERE category = ?";
  db.query(sql, ["Condiments"], (err, results) => {
    if (err) {
      console.error("Error fetching condiments products:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch condiments products" });
    }
    res.json(results);
  });
};
