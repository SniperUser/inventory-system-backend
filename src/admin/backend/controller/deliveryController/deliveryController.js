// controllers/deliveryController.js
import db from "../../config/db.js"; // your db connection file

// 🔹 Fetch all deliveries not delivered
// controllers/deliveryController.js
export const getDeliveries = (req, res) => {
  const sql = `
    SELECT d.*, ps.payment_status
    FROM delivery d
    LEFT JOIN delivery_payment_status ps
      ON d.id = ps.delivery_id
    WHERE d.delivery_status != 'delivered'
    ORDER BY d.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching deliveries:", err);
      return res.status(500).json({ error: "Failed to fetch deliveries" });
    }
    res.status(200).json(results);
  });
};

//fetch all deliveries that are delivered
export const getDeliveredDeliveries = (req, res) => {
  const sql = `
    SELECT d.*, ps.payment_status
    FROM delivery d
    LEFT JOIN delivery_payment_status ps
      ON d.id = ps.delivery_id
    WHERE d.delivery_status = 'delivered'
    ORDER BY d.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching delivered deliveries:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch delivered deliveries" });
    }
    res.status(200).json(results);
  });
};

// 🔹 Delete a delivery
export const deleteDelivery = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM delivery WHERE id = ?`;
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("❌ Error deleting delivery:", err);
      return res.status(500).json({ error: "Failed to delete delivery" });
    }
    res.status(200).json({ message: "Delivery deleted" });
  });
};

// 🔹 Update delivery status
export const updateDeliveryStatus = (req, res) => {
  const { id } = req.params;
  const { delivery_status } = req.body;

  const sql = `UPDATE delivery SET delivery_status = ? WHERE id = ?`;
  db.query(sql, [delivery_status, id], (err) => {
    if (err) {
      console.error("❌ Error updating delivery:", err);
      return res.status(500).json({ error: "Failed to update delivery" });
    }
    res.status(200).json({ message: "Delivery updated" });
  });
};
