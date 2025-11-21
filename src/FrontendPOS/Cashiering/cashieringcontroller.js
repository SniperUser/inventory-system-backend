import db from "../../admin/backend/config/db.js";

// ✅ Get all products
export const getProducts = (req, res) => {
  const sql = "SELECT * FROM product_stock ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
};

// ✅ Create a new sale and insert into sales_done + payment_status + cashier
export const createSalesOrder = (req, res) => {
  const {
    id, // ✅ sales_order id (must come from frontend)
    customer_name,
    email,
    phone,
    delivery_type,
    receiver,
    delivery_place,
    address,
    contact,
    payment,
    items,
    total,
    shipping_fee,
    cashier_name, // ✅ added (from frontend)
  } = req.body;

  // ✅ Insert into sales_done
  const salesDoneSql = `
    INSERT INTO sales_done
    (customer_name, email, phone, delivery_type, receiver, delivery_place, address, contact, payment, items, total, shipping_fee, delivery_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    salesDoneSql,
    [
      customer_name,
      email,
      phone,
      delivery_type,
      receiver,
      delivery_place,
      address,
      contact,
      payment,
      JSON.stringify(items), // ✅ store items as JSON
      total,
      shipping_fee,
      "done", // ✅ Always mark delivery as done
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting into sales_done:", err);
        return res.status(500).json({ message: "Database error" });
      }

      const saleId = result.insertId;

      // ✅ Insert into payment_status
      const paymentSql = `
        INSERT INTO payment_status (sale_id, customer_name, payment_status)
        VALUES (?, ?, 'paid')
      `;
      db.query(paymentSql, [saleId, customer_name], (err2) => {
        if (err2) {
          console.error("Error inserting into payment_status:", err2);
        }
      });

      // ✅ Insert into cashier (track sale & who handled it)
      const cashierSql = `
        INSERT INTO cashier (customer_name, cashier_name, items, total)
        VALUES (?, ?, ?, ?)
      `;
      db.query(
        cashierSql,
        [
          customer_name,
          cashier_name || "Unknown",
          JSON.stringify(items),
          total,
        ],
        (err3) => {
          if (err3) {
            console.error("Error inserting into cashier:", err3);
          }
        }
      );

      // ✅ Deduct stock for each item
      items.forEach((item) => {
        const stockSql = `
          UPDATE product_stock
          SET quantity = quantity - ?
          WHERE product_name = ?
        `;
        db.query(stockSql, [item.quantity, item.product_name], (err4) => {
          if (err4) {
            console.error(
              `Error updating stock for ${item.product_name}:`,
              err4
            );
          }
        });
      });

      // ✅ Remove from sales_order
      if (id) {
        const deleteSql = "DELETE FROM sales_order WHERE id = ?";
        db.query(deleteSql, [id], (err5) => {
          if (err5) {
            console.error("Error deleting from sales_order:", err5);
            return res.status(500).json({ message: "Database error" });
          }
        });
      }

      return res.status(201).json({
        message:
          "Sale moved to sales_done, cashier logged with total, stock deducted, payment_status set, and removed from sales_order!",
        saleId,
        total,
        customer_name,
        items,
        cashier_name,
        delivery_status: "done",
        payment_status: "paid",
      });
    }
  );
};

// ✅ Create a new pickup sale (no stock deduction)
export const createPickupOrder = (req, res) => {
  const {
    id, // sales_order id (from frontend if exists)
    customer_name,
    email,
    phone,
    delivery_type,
    receiver,
    delivery_place,
    address,
    contact,
    payment,
    items,
    total,
    shipping_fee,
    cashier_name,
  } = req.body;

  // 1️⃣ Insert into sales_done
  const salesDoneSql = `
    INSERT INTO sales_done
    (customer_name, email, phone, delivery_type, receiver, delivery_place, address, contact, payment, items, total, shipping_fee, delivery_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    salesDoneSql,
    [
      customer_name,
      email,
      phone,
      delivery_type || "pickup", // ✅ default pickup
      receiver,
      delivery_place,
      address,
      contact,
      payment,
      JSON.stringify(items), // store items as JSON
      total,
      shipping_fee || 0,
      "done", // ✅ pickup is always completed instantly
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting into sales_done:", err);
        return res.status(500).json({ message: "Database error" });
      }

      const saleId = result.insertId;

      // 2️⃣ Insert into payment_status
      const paymentSql = `
        INSERT INTO payment_status (sale_id, customer_name, payment_status)
        VALUES (?, ?, 'paid')
      `;
      db.query(paymentSql, [saleId, customer_name], (err2) => {
        if (err2) {
          console.error("Error inserting into payment_status:", err2);
        }
      });

      // 3️⃣ Insert into cashier (track sale & who handled it)
      const cashierSql = `
        INSERT INTO cashier (customer_name, cashier_name, items, total)
        VALUES (?, ?, ?, ?)
      `;
      db.query(
        cashierSql,
        [
          customer_name,
          cashier_name || "Unknown",
          JSON.stringify(items),
          total,
        ],
        (err3) => {
          if (err3) {
            console.error("Error inserting into cashier:", err3);
          }
        }
      );

      // 4️⃣ Remove from sales_order if exists
      if (id) {
        const deleteSql = "DELETE FROM sales_order WHERE id = ?";
        db.query(deleteSql, [id], (err4) => {
          if (err4) {
            console.error("Error deleting from sales_order:", err4);
            return res.status(500).json({ message: "Database error" });
          }
        });
      }

      return res.status(201).json({
        message:
          "Pickup sale moved to sales_done, cashier logged, payment_status set, and removed from sales_order!",
        saleId,
        total,
        customer_name,
        items,
        cashier_name,
        delivery_status: "done",
        payment_status: "paid",
      });
    }
  );
};

// ✅ Get all sales with payment status
export const getSalesWithPaymentStatus = (req, res) => {
  const sql = `
    SELECT 
      s.id AS sale_id,
      s.customer_name,
      p.id AS payment_id,
      COALESCE(p.payment_status, 'pending') AS payment_status
    FROM 
      sales_done s
    LEFT JOIN 
      payment_status p
    ON 
      s.id = p.sale_id
    ORDER BY s.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching sales with payment status:", err);
      return res.status(500).json({ message: "Database error" });
    }
    return res.status(200).json(results);
  });
};

// ✅ Verify customer by ID and Name
export const verifyCustomer = (req, res) => {
  const { id, customer_name } = req.body;

  if (!id || !customer_name) {
    return res.status(400).json({ message: "ID and Name are required" });
  }

  const sql = `
    SELECT * FROM sales_order 
    WHERE id = ? AND customer_name = ?
    LIMIT 1
  `;

  db.query(sql, [id, customer_name], (err, results) => {
    if (err) {
      console.error("Error verifying customer:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(results[0]);
  });
};

// ✅ Move Sales Order to Delivery
export const moveToDelivery = (req, res) => {
  const { id } = req.params;
  const { cashier_name } = req.body; // ✅ Pass logged-in cashier name from frontend

  // 1. Get the order from sales_order
  const selectSql = "SELECT * FROM sales_order WHERE id = ?";
  db.query(selectSql, [id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching sales order:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = results[0];

    // ✅ Ensure items are always a clean JSON array
    let items = [];
    try {
      items =
        typeof order.items === "string" ? JSON.parse(order.items) : order.items;
      if (!Array.isArray(items)) items = [];
    } catch (e) {
      items = [];
    }

    // ✅ Normalize qty field (sometimes it's `quantity`)
    items = items.map((item) => ({
      ...item,
      qty: item.qty ?? item.quantity ?? 0,
    }));

    // 2. Insert into delivery table with default "COD" for payment
    const insertSql = `
      INSERT INTO delivery 
      (customer_name, phone, receiver, delivery_place, address, delivery_type, payment, total, shipping_fee, items, delivery_status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    db.query(
      insertSql,
      [
        order.customer_name,
        order.phone,
        order.receiver,
        order.delivery_place,
        order.address,
        order.delivery_type,
        "COD", // ✅ Always default COD
        order.total,
        order.shipping_fee,
        JSON.stringify(items), // ✅ store normalized items
        "pending", // ✅ default delivery status
      ],
      (err2, result) => {
        if (err2) {
          console.error("❌ Error inserting into delivery:", err2);
          return res.status(500).json({ message: "Database error" });
        }

        const deliveryId = result.insertId;

        // 3. Insert into delivery_payment_status (default unpaid)
        const paymentSql = `
          INSERT INTO delivery_payment_status (delivery_id, customer_name, payment_status)
          VALUES (?, ?, 'unpaid')
        `;
        db.query(paymentSql, [deliveryId, order.customer_name], (err3) => {
          if (err3) {
            console.error(
              "❌ Error inserting into delivery_payment_status:",
              err3
            );
          }
        });

        // 4. Insert into cashier log
        const cashierSql = `
          INSERT INTO cashier (customer_name, cashier_name, items, total)
          VALUES (?, ?, ?, ?)
        `;
        db.query(
          cashierSql,
          [
            order.customer_name,
            cashier_name || "Unknown",
            JSON.stringify(items), // ✅ store normalized items
            order.total,
          ],
          (err4) => {
            if (err4) {
              console.error("❌ Error inserting into cashier:", err4);
            }
          }
        );

        // 5. Delete from sales_order
        const deleteSql = "DELETE FROM sales_order WHERE id = ?";
        db.query(deleteSql, [id], (err5) => {
          if (err5) {
            console.error("❌ Error deleting from sales_order:", err5);
            return res.status(500).json({ message: "Database error" });
          }

          return res.status(200).json({
            message:
              "✅ Order moved to Delivery, cashier logged with total, delivery_payment_status created, and removed from sales_order",
            deliveryId,
            customer_name: order.customer_name,
            cashier_name: cashier_name || "Unknown",
            payment_status: "unpaid",
            delivery_status: "pending",
          });
        });
      }
    );
  });
};

// ✅ Complete Sales Order (move to sales_done + delete from sales_order)
export const completeSalesOrder = (req, res) => {
  const {
    id, // sales_order ID to delete after success
    customer_name,
    email,
    phone,
    delivery_type,
    receiver,
    delivery_place,
    address,
    contact,
    payment,
    items,
    total,
    shipping_fee,
    delivery_status, // pending, on the way, or done
    payment_status, // pending, paid, or partial
  } = req.body;

  // 1️⃣ Insert into sales_done
  const salesDoneSql = `
    INSERT INTO sales_done
    (customer_name, email, phone, delivery_type, receiver, delivery_place, address, contact, payment, total, shipping_fee, delivery_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    salesDoneSql,
    [
      customer_name,
      email,
      phone,
      delivery_type,
      receiver,
      delivery_place,
      address,
      contact,
      payment,
      total,
      shipping_fee,
      delivery_status || "pending",
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting into sales_done:", err);
        return res.status(500).json({ message: "Database error" });
      }

      const saleId = result.insertId;

      // 2️⃣ Insert into payment_status (keep status)
      const paymentSql = `
        INSERT INTO payment_status (sale_id, customer_name, payment_status)
        VALUES (?, ?, ?)
      `;
      db.query(
        paymentSql,
        [saleId, customer_name, payment_status || "pending"],
        (err2) => {
          if (err2) {
            console.error("Error inserting into payment_status:", err2);
          }
        }
      );

      // 3️⃣ Deduct stock
      if (Array.isArray(items) && items.length > 0) {
        items.forEach((item) => {
          const updateSql = `
            UPDATE product_stock 
            SET quantity = quantity - ? 
            WHERE id = ? AND quantity >= ?
          `;
          db.query(
            updateSql,
            [item.quantity, item.id, item.quantity],
            (err2) => {
              if (err2) {
                console.error(
                  `Error updating stock for product ID ${item.id}:`,
                  err2
                );
              }
            }
          );
        });
      }

      // 4️⃣ Delete from sales_order (keep payment_status table untouched)
      const deleteSql = "DELETE FROM sales_order WHERE id = ?";
      db.query(deleteSql, [id], (err3) => {
        if (err3) {
          console.error("Error deleting from sales_order:", err3);
          return res
            .status(500)
            .json({ message: "Error deleting from sales_order" });
        }

        return res.status(201).json({
          message:
            "Sale moved to sales_done, payment status recorded, stock updated, and removed from sales_order successfully!",
          saleId,
          total,
          customer_name,
          items,
          delivery_status: delivery_status || "pending",
          payment_status: payment_status || "pending",
        });
      });
    }
  );
};
