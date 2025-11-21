import db from "../../../admin/backend/config/db.js";

export const getProductsByCategory = (req, res) => {
  // Example: filter by category name "Can Goods"
  const sql = "SELECT * FROM product_stock WHERE category = ?";
  db.query(sql, ["Can Goods"], (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
    res.json(results);
  });
};
