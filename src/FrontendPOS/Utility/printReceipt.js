// src/utils/printReceipt.js
export const printReceipt = (orderData) => {
  const orderItems =
    orderData.items?.length > 0
      ? orderData.items
          .map(
            (item) => `
        <tr>
          <td>${item.product_name || ""}</td>
          <td>${item.quantity || 0}</td>
          <td>₱${Number(item.price || 0).toFixed(2)}</td>
          <td>₱${(Number(item.quantity || 0) * Number(item.price || 0)).toFixed(
            2
          )}</td>
        </tr>
      `
          )
          .join("")
      : `<tr><td colspan="4" style="text-align:center;">No items</td></tr>`;

  const productTotal = orderData.items?.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const shippingFee =
    orderData.delivery_type === "delivery"
      ? Number(orderData.shipping_fee || 0)
      : 0;

  // Grand total includes shipping (matches footer display)
  const grandTotalWithShipping = productTotal + shippingFee;

  // Change calculation matches footer
  const change = Math.max(
    Number(orderData.payment || 0) - grandTotalWithShipping,
    0
  );

  const receiptWindow = window.open("", "PRINT", "height=600,width=800");

  receiptWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2, h3 { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          table, th, td { border: 1px solid #333; }
          th, td { padding: 8px; text-align: left; }
          .total { font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>🛍️ Sample Store Name</h2>
        <p>📍 Sample Location</p>
        <p>📅 ${new Date().toLocaleString()}</p>

        <h3>Customer Details</h3>
        <p><b>Name:</b> ${orderData.customer_name}</p>
        <p><b>Phone:</b> ${orderData.phone}</p>
        ${
          orderData.delivery_type === "delivery"
            ? `
              <p><b>Receiver:</b> ${orderData.receiver}</p>
              <p><b>Delivery Place:</b> ${orderData.delivery_place}</p>
              <p><b>Address:</b> ${orderData.address}</p>
              <p><b>Contact:</b> ${orderData.contact}</p>
            `
            : `<p><b>Pickup:</b> Walk-in / Pickup</p>`
        }
        <p><b>Payment:</b> ₱${Number(orderData.payment).toFixed(2)}</p>

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
            ${orderItems}
            ${
              orderData.delivery_type === "delivery"
                ? `<tr>
                     <td colspan="3">Shipping Fee</td>
                     <td>₱${shippingFee.toFixed(2)}</td>
                   </tr>`
                : ""
            }
            <tr class="total">
              <td colspan="3">Grand Total</td>
              <td>₱${grandTotalWithShipping.toFixed(2)}</td>
            </tr>
            <tr class="total">
              <td colspan="3">Change</td>
              <td>₱${change.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <p style="margin-top:20px;">Thank you for shopping with us! 🎉</p>
      </body>
    </html>
  `);

  receiptWindow.document.close();
  receiptWindow.focus();
  receiptWindow.print();
  receiptWindow.close();
};
