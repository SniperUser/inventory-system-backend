import db from "../../../admin/backend/config/db.js";

// ✅ Shipping rates
const shippingRates = {
  Kalabugao: 50,
  Hagpa: 70,
  Kabagtukan: 90,
  Pulahon: 100,
  "San Vicente": 60,
  Fatima: 70,
  Landing: 60,
  Lamingan: 70,
  Kiudto: 90,
  Kaanibungan: 100,
  Mahagwa: 110,
  Bulonay: 200,
  Nasandigan: 90,
  Minlanaw: 90,
  Kalampigan: 200,
  Mintapud: 200,
};

// ✅ Create new order + deduct stock safely
export const createOrder = (req, res) => {
  const { customer, items, total, shippingFee } = req.body;

  if (!customer || !items || items.length === 0) {
    return res.status(400).json({ error: "Invalid order data" });
  }

  // Transform formData into DB fields
  const customer_name = `${customer.firstname} ${customer.lastname}`;
  const email = customer.email || "";
  const phone = customer.telephone || "";
  const delivery_type = customer.deliveryType || "";
  const receiver = customer.receiverName || "";
  const delivery_place = customer.deliveryPlace || "";
  const address = `${customer.address1 || ""}, ${customer.city || ""}, ${
    customer.country || ""
  }`;
  const contact = customer.contactNumber || "";
  const payment = customer.payment || "";

  // ✅ Use shippingFee sent from frontend
  const shipping_fee = shippingFee || 0;

  // ✅ DB `total` = items only
  const items_total = total;

  // ✅ Grand total (items + shipping)
  const total_with_shipping = items_total + shipping_fee;

  // ✅ Fix: map items to store ORDERED QTY (not stock qty)
  const orderItems = items.map((cartItem) => ({
    id: cartItem.id,
    product_name: cartItem.product_name,
    price: cartItem.price,
    qty: cartItem.qty, // ordered quantity
    total: cartItem.price * cartItem.qty,
  }));

  const insertOrderSql = `
    INSERT INTO sales_order
    (customer_name, email, phone, delivery_type, receiver, delivery_place, address, contact, payment, items, shipping_fee, total, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const values = [
    customer_name,
    email,
    phone,
    delivery_type,
    receiver,
    delivery_place,
    address,
    contact,
    payment,
    JSON.stringify(orderItems), // ✅ fixed
    shipping_fee,
    total_with_shipping,
  ];

  db.beginTransaction((err) => {
    if (err) {
      console.error("❌ Transaction start error:", err);
      return res.status(500).json({ error: "Transaction failed" });
    }

    // 1️⃣ Check stock from `product_stock`
    const productIds = items.map((item) => item.id);
    db.query(
      "SELECT id, product_name, quantity FROM product_stock WHERE id IN (?)",
      [productIds],
      (err, results) => {
        if (err) {
          return db.rollback(() => {
            console.error("❌ Stock check error:", err);
            res.status(500).json({ error: "Stock check failed" });
          });
        }

        // Validate requested quantities
        for (let cartItem of items) {
          const dbProduct = results.find((p) => p.id === cartItem.id);
          if (!dbProduct || dbProduct.quantity < cartItem.qty) {
            return db.rollback(() => {
              res.status(400).json({
                error: "Not enough stock",
                productId: cartItem.id,
                productName: dbProduct?.product_name || "Unknown",
                requested: cartItem.qty,
                available: dbProduct?.quantity || 0,
              });
            });
          }
        }

        // 2️⃣ Insert order
        db.query(insertOrderSql, values, (err, result) => {
          if (err) {
            return db.rollback(() => {
              console.error("❌ Error creating order:", err);
              res.status(500).json({ error: "Failed to create order" });
            });
          }

          const orderId = result.insertId;

          // 3️⃣ Deduct stock
          const updateStock = items.map((item) => {
            return new Promise((resolve, reject) => {
              db.query(
                "UPDATE product_stock SET quantity = quantity - ? WHERE id = ?",
                [item.qty, item.id],
                (err, result) => {
                  if (err) return reject(err);
                  if (result.affectedRows === 0) {
                    return reject(
                      new Error(
                        `Stock deduction failed for product ID ${item.id}`
                      )
                    );
                  }
                  resolve();
                }
              );
            });
          });

          Promise.all(updateStock)
            .then(() => {
              // 4️⃣ Commit transaction
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error("❌ Commit error:", err);
                    res
                      .status(500)
                      .json({ error: "Transaction commit failed" });
                  });
                }
                res.status(201).json({
                  message: "✅ Order created",
                  orderId,
                  shipping_fee,
                });
              });
            })
            .catch((stockError) => {
              db.rollback(() => {
                console.error("❌ Stock update failed:", stockError);
                res.status(400).json({
                  error: stockError.message || "Stock update failed",
                });
              });
            });
        });
      }
    );
  });
};
