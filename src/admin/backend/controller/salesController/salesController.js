// controllers/salesController.js
import db from "../../config/db.js";

// 🔹 Get all sales records with full cashier info
export const getSales = (req, res) => {
  const sql = `
    SELECT 
      s.id,
      s.customer_name,
      s.email,
      s.phone,
      s.delivery_type,
      s.receiver,
      s.delivery_place,
      s.address,
      s.payment,
      s.total,
      s.shipping_fee,
      s.delivery_status,
      s.created_at,
      s.items,

      -- Cashier (from cashier table)
      c.cashier_name,

      -- Full Cashier Info (from employee table)
      e.id AS cashier_id,
      e.name,
      e.isActive,
      e.address AS cashier_address,
      e.contact AS cashier_contact,
      e.email AS cashier_email,
      e.role,
      e.created_at AS cashier_created_at,
      e.position,
      e.is_archived,
      e.birthday

    FROM sales_done s
    LEFT JOIN cashier c ON s.customer_name = c.customer_name
    LEFT JOIN employee e ON c.cashier_name = e.name
    ORDER BY s.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching sales records:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const formatted = results.map((row) => ({
      ...row,
      items: (() => {
        try {
          return JSON.parse(row.items);
        } catch {
          return [];
        }
      })(),
    }));

    res.status(200).json(formatted);
  });
};
