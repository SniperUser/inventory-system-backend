// instantNoodlesController.js
import db from "../../../admin/backend/config/db.js";

// ✅ Get all Instant Noodles products
export const getInstantNoodles = (req, res) => {
  // Filter products where category is "Instant Noodles"
  const sql =
    "SELECT * FROM product_stock WHERE category = ? AND is_archived = 0";

  db.query(sql, ["Instant Noodles"], (err, results) => {
    if (err) {
      console.error("❌ Error fetching Instant Noodles:", err);
      return res.status(500).json({ error: "Failed to fetch Instant Noodles" });
    }

    res.status(200).json(results);
  });
};
