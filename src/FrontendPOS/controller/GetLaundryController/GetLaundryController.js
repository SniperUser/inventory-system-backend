// laundryController.js
import db from "../../../admin/backend/config/db.js";

// Fetch all products in the "Laundry" category
export const getLaundry = (req, res) => {
  const sql = "SELECT * FROM product_stock WHERE category = ?";
  db.query(sql, ["Laundry"], (err, results) => {
    if (err) {
      console.error("Error fetching laundry products:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch laundry products" });
    }
    res.json(results);
  });
};
