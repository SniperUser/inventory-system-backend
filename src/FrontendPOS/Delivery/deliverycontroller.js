// controller/deliveryController.js
import db from "../../admin/backend/config/db.js";
import bcrypt from "bcryptjs";

// ✅ Get all deliveries with payment status
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
        quantity: item.quantity ?? item.qty ?? 0,
      }));

      return {
        ...row,
        total: Number(row.total) || 0,
        shipping_fee: Number(row.shipping_fee) || 0,
        items,
      };
    });

    res.json(formatted);
  });
};

// ✅ Update or insert payment status
export const updatePaymentStatus = (req, res) => {
  const { delivery_id, payment_status } = req.body;

  if (!delivery_id || !payment_status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO delivery_payment_status (delivery_id, customer_name, payment_status, updated_at)
    VALUES (?, (SELECT customer_name FROM delivery WHERE id = ?), ?, NOW())
    ON DUPLICATE KEY UPDATE 
      payment_status = VALUES(payment_status), 
      updated_at = NOW()
  `;

  db.query(query, [delivery_id, delivery_id, payment_status], (err) => {
    if (err) {
      console.error("❌ Error updating payment status:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "✅ Payment status updated successfully" });
  });
};

// ✅ Verify delivery user
export const verifyDeliveryUser = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  const query = `
    SELECT 
      r.id AS register_id, 
      r.username, 
      r.password, 
      r.image,
      e.id AS employee_id, 
      e.name, 
      e.position, 
      e.role AS employee_role,
      e.birthday,
      e.address,
      e.contact,
      e.email
    FROM register r
    LEFT JOIN employee e ON r.employee_id = e.id
    WHERE r.username = ?
    LIMIT 1
  `;

  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error("❌ Error verifying user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = results[0];

    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: "Invalid password" });
      }

      if (!user.position || user.position.toLowerCase() !== "delivery") {
        return res
          .status(403)
          .json({ error: "Not authorized as delivery personnel" });
      }

      res.json({
        success: true,
        employee: {
          id: user.employee_id,
          username: user.username,
          name: user.name,
          birthday: user.birthday,
          address: user.address,
          contact: user.contact,
          email: user.email,
          position: user.position,
          role: user.employee_role,
          image: user.image,
        },
      });
    } catch (e) {
      console.error("❌ Error comparing password:", e);
      res.status(500).json({ error: "Server error" });
    }
  });
};

// ✅ Update Profile (register + employee)
export const updateProfile = (req, res) => {
  try {
    // Ensure req.body exists
    const {
      userId,
      username,
      name,
      birthday,
      address,
      contact,
      email,
      position,
    } = req.body || {};

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId in request body",
      });
    }

    // Handle image
    let imagePath = null;
    if (req.file) {
      imagePath = "uploads/" + req.file.filename;
    }

    const sqlRegister = `
      UPDATE register 
      SET username = ?, image = COALESCE(?, image) 
      WHERE employee_id = ?
    `;

    const sqlEmployee = `
      UPDATE employee
      SET name = ?, birthday = ?, address = ?, contact = ?, email = ?, position = ?
      WHERE id = ?
    `;

    db.query(sqlRegister, [username, imagePath, userId], (errRegister) => {
      if (errRegister) {
        console.error("❌ Error updating register:", errRegister);
        return res
          .status(500)
          .json({ success: false, message: "Database error (register)" });
      }

      db.query(
        sqlEmployee,
        [name, birthday, address, contact, email, position, userId],
        (errEmployee) => {
          if (errEmployee) {
            console.error("❌ Error updating employee:", errEmployee);
            return res
              .status(500)
              .json({ success: false, message: "Database error (employee)" });
          }

          return res.json({
            success: true,
            message: "Profile updated successfully!",
          });
        }
      );
    });
  } catch (err) {
    console.error("❌ Unexpected error in updateProfile:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error in updateProfile" });
  }
};

// ✅ Change Password (verify old password first)
export const changePassword = (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body || {};

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (userId, oldPassword, newPassword)",
      });
    }

    db.query(
      "SELECT password FROM register WHERE employee_id = ?",
      [userId],
      async (err, results) => {
        if (err) {
          console.error("❌ Error fetching user:", err);
          return res
            .status(500)
            .json({ success: false, message: "Database error" });
        }
        if (results.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }

        const hashedPassword = results[0].password;

        const isMatch = await bcrypt.compare(oldPassword, hashedPassword);
        if (!isMatch) {
          return res
            .status(400)
            .json({ success: false, message: "Old password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newPassword, salt);

        db.query(
          "UPDATE register SET password = ? WHERE employee_id = ?",
          [newHashedPassword, userId],
          (err) => {
            if (err) {
              console.error("❌ Error updating password:", err);
              return res
                .status(500)
                .json({ success: false, message: "Database error" });
            }
            return res.json({
              success: true,
              message: "Password updated successfully!",
            });
          }
        );
      }
    );
  } catch (err) {
    console.error("❌ Unexpected error in changePassword:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error in changePassword" });
  }
};

// ✅ Update Delivery Status
export const updateDeliveryStatus = (req, res) => {
  const { id, status, rider_name } = req.body;

  if (!id || !status || !rider_name) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields (id, status, rider_name)",
    });
  }

  const sql =
    "UPDATE delivery SET delivery_status = ?, rider_name = ? WHERE id = ?";

  db.query(sql, [status, rider_name, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating delivery status:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery not found" });
    }

    return res.json({
      success: true,
      message: "✅ Delivery status and rider updated successfully!",
      updatedId: id,
      newStatus: status,
      rider: rider_name,
    });
  });
};

// UPDATE DELIVERY STATUS WITH REASON (for not delivered)
// 🚚 1. Mark delivery as NOT delivered and log reason in returns
export const updateDeliveryStatusWithReason = (req, res) => {
  const { id, status, reason, deliveryPersonId, deliveryPersonName } = req.body;

  if (!id || !status || !reason) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields (id, status, reason)",
    });
  }

  // 1️⃣ Force status to "not delivered" for clarity
  const finalStatus = "not delivered";

  const updateSql = "UPDATE delivery SET delivery_status = ? WHERE id = ?";

  db.query(updateSql, [finalStatus, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating delivery status:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery not found" });
    }

    // 2️⃣ Insert into returns
    const insertSql = `
      INSERT INTO returns (
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
      )
      SELECT 
        d.id,
        d.customer_name,
        d.phone,
        d.receiver,
        d.delivery_place,
        d.address,
        d.payment,
        ps.payment_status,
        ?,
        d.shipping_fee,
        d.items,
        d.total,
        ?,
        ?, 
        ?, 
        NOW()
      FROM delivery d
      LEFT JOIN delivery_payment_status ps ON d.id = ps.delivery_id
      WHERE d.id = ?
    `;

    db.query(
      insertSql,
      [
        finalStatus,
        reason,
        deliveryPersonId || null,
        deliveryPersonName || null,
        id,
      ],
      (insertErr) => {
        if (insertErr) {
          console.error("❌ Error inserting into returns:", insertErr);
          return res
            .status(500)
            .json({ success: false, message: "Database error (returns)" });
        }

        return res.json({
          success: true,
          message: "✅ Delivery marked as not delivered and stored in returns.",
          updatedId: id,
          newStatus: finalStatus,
          reason,
        });
      }
    );
  });
};

// ✅ 2. Mark delivery as DONE delivered and move into sales_done + payment_status
// ✅ Mark as delivered + insert into sales_done + payment_status
export const markDelivered = (req, res) => {
  const {
    id,
    customer_name,
    email,
    phone,
    receiver,
    delivery_place,
    address,
    contact,
    payment,
    total,
    shipping_fee,
    items,
  } = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Delivery ID required" });
  }

  // 1️⃣ Always set delivery_status = "delivered"
  const finalStatus = "delivered";

  db.query(
    "UPDATE delivery SET delivery_status = ? WHERE id = ?",
    [finalStatus, id],
    (err, results) => {
      if (err) {
        console.error("❌ Error updating delivery status:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "⚠️ No delivery found with that ID",
        });
      }

      console.log("✅ Delivery table update result:", results);

      // 2️⃣ Insert into sales_done
      const insertSales = `
        INSERT INTO sales_done (
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
          delivery_status,
          created_at,
          items
        ) VALUES (?, ?, ?, 'delivery', ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
      `;

      db.query(
        insertSales,
        [
          customer_name,
          email,
          phone,
          receiver,
          delivery_place,
          address,
          contact,
          payment,
          total,
          shipping_fee,
          finalStatus, // 👈 will be "delivered"
          JSON.stringify(items),
        ],
        (err, salesResult) => {
          if (err) {
            console.error("❌ Error inserting into sales_done:", err);
            return res.status(500).json({
              success: false,
              message: "Database error (sales_done)",
            });
          }

          const saleId = salesResult.insertId;

          // 3️⃣ Insert into payment_status (for sales_done)
          const insertPayment = `
            INSERT INTO payment_status (
              sale_id,
              payment_status,
              customer_name
            ) VALUES (?, ?, ?)
          `;

          db.query(insertPayment, [saleId, "paid", customer_name], (err) => {
            if (err) {
              console.error("❌ Error inserting into payment_status:", err);
              return res.status(500).json({
                success: false,
                message: "Database error (payment_status)",
              });
            }

            // 4️⃣ Insert/Update delivery_payment_status
            const insertDeliveryPayment = `
              INSERT INTO delivery_payment_status (delivery_id, customer_name, payment_status, updated_at)
              VALUES (?, ?, 'paid', NOW())
              ON DUPLICATE KEY UPDATE
                payment_status = VALUES(payment_status),
                updated_at = NOW()
            `;

            db.query(insertDeliveryPayment, [id, customer_name], (err) => {
              if (err) {
                console.error(
                  "❌ Error inserting into delivery_payment_status:",
                  err
                );
                return res.status(500).json({
                  success: false,
                  message: "Database error (delivery_payment_status)",
                });
              }

              // 5️⃣ Delete from returns if delivery was successful
              const deleteReturn = `
                DELETE FROM returns WHERE delivery_id = ?
              `;

              db.query(deleteReturn, [id], (err) => {
                if (err) {
                  console.error("❌ Error deleting from returns:", err);
                  return res.status(500).json({
                    success: false,
                    message: "Database error (returns delete)",
                  });
                }

                res.json({
                  success: true,
                  message:
                    "✅ Delivery marked as delivered, sales_done, payment_status, delivery_payment_status updated & returns cleared.",
                  saleId,
                });
              });
            });
          });
        }
      );
    }
  );
};
