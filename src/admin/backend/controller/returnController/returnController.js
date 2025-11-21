// controllers/returnsController.js
import db from "../../config/db.js";

// 🔹 Get all returns records with delivery person details
export const getReturns = (req, res) => {
  const sql = `
    SELECT 
      r.id,
      r.delivery_id,
      r.customer_name,
      r.phone,
      r.receiver,
      r.delivery_place,
      r.address,
      r.payment,
      r.payment_status,
      r.delivery_status,
      CAST(r.shipping_fee AS DECIMAL(10,2)) AS shipping_fee,
      CAST(r.total AS DECIMAL(10,2)) AS total,
      r.reason,
      r.delivery_person_id,
      r.delivery_person_name,
      r.created_at,
      r.items,
      e.name AS delivery_person_fullname,
      e.contact AS delivery_person_contact,
      e.email AS delivery_person_email
    FROM returns r
    LEFT JOIN employee e ON r.delivery_person_id = e.id
    ORDER BY r.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching returns:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const formatted = results.map((row) => {
      let items = [];
      try {
        items = JSON.parse(row.items || "[]");
      } catch {
        items = [];
      }

      // 🔹 Ensure items have quantity
      items = items.map((item) => ({
        ...item,
        quantity: item.quantity ?? item.qty ?? 1,
        price: Number(item.price) || 0,
      }));

      return {
        ...row,
        total: Number(row.total) || 0,
        shipping_fee: Number(row.shipping_fee) || 0,
        reason: row.reason || "—",
        payment_status: row.payment_status || "unpaid",
        delivery_status: row.delivery_status || "pending",
        items,
      };
    });

    res.status(200).json(formatted);
  });
};
