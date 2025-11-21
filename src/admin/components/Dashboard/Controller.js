import db from "../../backend/config/db.js";

// ✅ Controller to get sales data
export const getSales = (req, res) => {
  const query = "SELECT items, created_at FROM sales_done";

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching sales:", err);
      return res.status(500).json({ error: "Database error" });
    }

    let salesData = [];

    results.forEach((row) => {
      try {
        const items = JSON.parse(row.items); // items column is JSON
        items.forEach((item) => {
          salesData.push({
            product_name: item.product_name,
            quantity: item.quantity,
            date: row.created_at,
          });
        });
      } catch (e) {
        console.error("❌ Error parsing items JSON:", e);
      }
    });

    res.json(salesData);
  });
};

// ✅ Controller to get products (only specific fields)
export const getProducts = (req, res) => {
  const query = `
    SELECT product_name, quantity, price, image 
    FROM product_stock
    WHERE is_archived = 0
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching products:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
};

// ✅ Controller to get orders (only specific fields)
export const getOrders = (req, res) => {
  const query = `
    SELECT id, customer_name, email, phone, delivery_type, receiver, delivery_place,
           address, contact, payment, items, total, created_at, shipping_fee, delivery_status
    FROM sales_order
    ORDER BY created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching orders:", err);
      return res.status(500).json({ error: "Database error" });
    }

    try {
      const formatted = results.map((row) => {
        let parsedItems = [];
        if (row.items) {
          try {
            parsedItems = JSON.parse(row.items);
          } catch (e) {
            console.error("❌ Error parsing items JSON:", e);
            parsedItems = [];
          }
        }

        return {
          id: row.id,
          customer_name: row.customer_name,
          email: row.email,
          phone: row.phone,
          delivery_type: row.delivery_type,
          receiver: row.receiver,
          delivery_place: row.delivery_place,
          address: row.address,
          contact: row.contact,
          payment: row.payment,
          shipping_fee: Number(row.shipping_fee) || 0,
          delivery_status: row.delivery_status,
          total: Number(row.total) || 0,
          created_at: row.created_at,
          items: parsedItems.map((item) => ({
            id: item.id,
            product_name: item.product_name || "-",
            quantity: item.qty || item.quantity || 0,
            price: Number(item.price) || 0,
          })),
        };
      });

      res.json(formatted);
    } catch (e) {
      console.error("❌ Error formatting orders:", e);
      res.status(500).json({ error: "Data formatting error" });
    }
  });
};
// ✅ Controller to get employees (excluding archived)
export const getEmployees = (req, res) => {
  const query = `
    SELECT id, name, isActive, address, contact, email, role, created_at, position, birthday
    FROM employee
    WHERE is_archived = 0
    ORDER BY created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching employees:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
};
// ✅ Controller to get return sales (only specific fields)
export const getReturnSales = (req, res) => {
  const query = `
    SELECT 
      ROW_NUMBER() OVER (ORDER BY created_at DESC) AS row_number,
      id,
      delivery_id,
      customer_name,
      phone,
      receiver,
      delivery_place,
      address,
      payment,
      payment_status,
      delivery_status,
      shipping_fee,
      items,
      total,
      reason,
      delivery_person_id,
      delivery_person_name,
      created_at
    FROM returns
    ORDER BY created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching return sales:", err);
      return res.status(500).json({ error: "Database error" });
    }

    try {
      const formatted = results.map((row) => {
        let parsedItems = [];
        try {
          parsedItems = JSON.parse(row.items);
        } catch (e) {
          console.error("❌ Error parsing return items:", e);
        }

        return {
          number: row.row_number, // 👈 numbering field
          id: row.id,
          delivery_id: row.delivery_id,
          customer_name: row.customer_name,
          phone: row.phone,
          receiver: row.receiver,
          delivery_place: row.delivery_place,
          address: row.address,
          payment: row.payment,
          payment_status: row.payment_status,
          delivery_status: row.delivery_status,
          shipping_fee: Number(row.shipping_fee) || 0,
          items: parsedItems,
          total: Number(row.total) || 0,
          reason: row.reason || "N/A",
          delivery_person_id: row.delivery_person_id,
          delivery_person_name: row.delivery_person_name,
          created_at: row.created_at,
        };
      });

      res.json(formatted);
    } catch (e) {
      console.error("❌ Error formatting return sales:", e);
      res.status(500).json({ error: "Formatting error" });
    }
  });
};
// ✅ Controller to get deliveries (only specific fields)
export const getDeliveries = (req, res) => {
  const query = `
    SELECT 
      d.id, 
      d.customer_name, 
      d.phone, 
      d.receiver, 
      d.delivery_place, 
      d.address, 
      d.payment, 
      CAST(d.total AS DECIMAL(10,2)) AS total, 
      CAST(d.shipping_fee AS DECIMAL(10,2)) AS shipping_fee, 
      d.items, 
      d.delivery_status, 
      d.created_at,
      d.rider_name, 
      ps.payment_status
    FROM delivery d
    LEFT JOIN delivery_payment_status ps 
      ON d.id = ps.delivery_id
    ORDER BY d.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching deliveries:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const formatted = results.map((row) => {
      let items = [];
      try {
        items = JSON.parse(row.items || "[]");
      } catch {
        items = [];
      }

      items = items.map((item) => ({
        ...item,
        quantity: item.quantity ?? item.qty ?? 0, // ✅ make sure quantity is included
      }));

      return {
        ...row,
        total: Number(row.total) || 0,
        shipping_fee: Number(row.shipping_fee) || 0,
        items,
        rider_name: row.rider_name || "N/A", // ✅ rider included in response
      };
    });

    res.json(formatted);
  });
};
