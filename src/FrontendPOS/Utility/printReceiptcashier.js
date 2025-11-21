// src/Utility/printReceipt.js
export const printReceipt = (orderData) => {
  // normalize items (support both .qty and .quantity)
  const items = Array.isArray(orderData.items)
    ? orderData.items.map((item) => ({
        product_name: item.product_name || "",
        quantity: Number(item.quantity ?? item.qty ?? 0),
        price: Number(item.price || 0),
      }))
    : [];

  const productTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shippingFee =
    orderData.delivery_type === "delivery"
      ? Number(orderData.shipping_fee || 0)
      : 0;

  const grandTotal = productTotal + shippingFee;

  const paymentGiven = Number(orderData.payment || 0);
  const change = Math.max(paymentGiven - grandTotal, 0);

  const receiptWindow = window.open("", "PRINT", "height=600,width=800");

  receiptWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2, h3 { margin: 5px 0; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          table, th, td { border: 1px solid #333; }
          th, td { padding: 8px; text-align: left; }
          .total { font-weight: bold; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        <h2>🛒 Store Receipt</h2>
        <p class="center">Date: ${new Date().toLocaleString()}</p>
        
        <h3>Customer Details</h3>
        <p><b>Name:</b> ${orderData.customer_name || ""}</p>
        <p><b>Phone:</b> ${orderData.phone || ""}</p>
        <p><b>Email:</b> ${orderData.email || ""}</p>
        ${
          orderData.delivery_type === "delivery"
            ? `
              <p><b>Receiver:</b> ${orderData.receiver || ""}</p>
              <p><b>Delivery Place:</b> ${orderData.delivery_place || ""}</p>
              <p><b>Address:</b> ${orderData.address || ""}</p>
              <p><b>Contact:</b> ${orderData.contact || ""}</p>
            `
            : `<p><b>Pickup Type:</b> Walk-in / Pickup</p>`
        }

        <h3>Order Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${
              items.length > 0
                ? items
                    .map(
                      (item) => `
                  <tr>
                    <td>${item.product_name}</td>
                    <td>${item.quantity}</td>
                    <td>₱${item.price.toFixed(2)}</td>
                    <td>₱${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                `
                    )
                    .join("")
                : `<tr><td colspan="4" class="center">No items</td></tr>`
            }
            ${
              shippingFee > 0
                ? `<tr>
                     <td colspan="3">Shipping Fee</td>
                     <td>₱${shippingFee.toFixed(2)}</td>
                   </tr>`
                : ""
            }
            <tr class="total">
              <td colspan="3">Grand Total</td>
              <td>₱${grandTotal.toFixed(2)}</td>
            </tr>
            <tr class="total">
              <td colspan="3">Payment Given</td>
              <td>₱${paymentGiven.toFixed(2)}</td>
            </tr>
            <tr class="total">
              <td colspan="3">Change</td>
              <td>₱${change.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <p class="center" style="margin-top:20px;">✅ Thank you for shopping with us!</p>
      </body>
    </html>
  `);

  receiptWindow.document.close();
  receiptWindow.focus();
  receiptWindow.print();
  receiptWindow.close();
};
