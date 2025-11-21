// frozenController.js
import db from "../../../admin/backend/config/db.js";

// Fetch all products in the "Frozen Goods" category
export const getFrozenGoods = (req, res) => {
  const sql = "SELECT * FROM product_stock WHERE category = ?";
  db.query(sql, ["Frozen Goods"], (err, results) => {
    if (err) {
      console.error("Error fetching frozen goods products:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch frozen goods products" });
    }
    res.json(results);
  });
};
