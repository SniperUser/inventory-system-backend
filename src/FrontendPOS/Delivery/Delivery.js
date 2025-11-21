// FrontendPOS/Delivery/Delivery.js
import React from "react";

const staffdelivery = () => {
  const deliveries = [
    {
      id: 1,
      customer_name: "Mike Cabug",
      phone: "09090909099",
      receiver: "Mike or Michelle",
      delivery_place: "Lamingan",
      address: "Lamingan City, , ",
      delivery_type: "delivery",
      payment: "gcash",
      total: 610.0,
      shipping_fee: 70.0,
      items: [
        {
          id: 40,
          product_name: "Century Tuna Caldereta",
          quantity: 3,
          price: 200,
        },
        { id: 41, product_name: "555 Sardines", quantity: 2, price: 55 },
      ],
      delivery_status: "pending",
      created_at: "2025-08-27 11:56:29",
    },
    {
      id: 2,
      customer_name: "Anna Reyes",
      phone: "09123456789",
      receiver: "Anna R.",
      delivery_place: "Davao",
      address: "Davao City, , ",
      delivery_type: "pickup",
      payment: "cash",
      total: 500.0,
      shipping_fee: 0.0,
      items: [{ id: 42, product_name: "Coke 1L", quantity: 5, price: 100 }],
      delivery_status: "on the way",
      created_at: "2025-08-28 09:30:15",
    },
  ];

  const handleGet = (delivery) => {
    alert(`Get delivery for ${delivery.customer_name}`);
  };

  const handleUpdateStatus = (delivery) => {
    alert(`Update delivery status for ${delivery.customer_name}`);
  };

  return (
    <div className="container mt-4">
      <h2>Staff Delivery Dashboard</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Receiver</th>
              <th>Delivery Place</th>
              <th>Address</th>
              <th>Delivery Type</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Shipping Fee</th>
              <th>Items</th>
              <th>Delivery Status</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.customer_name}</td>
                <td>{d.phone}</td>
                <td>{d.receiver}</td>
                <td>{d.delivery_place}</td>
                <td>{d.address}</td>
                <td>{d.delivery_type}</td>
                <td>{d.payment}</td>
                <td>₱{d.total.toFixed(2)}</td>
                <td>₱{d.shipping_fee.toFixed(2)}</td>
                <td>
                  <ul style={{ paddingLeft: "15px", margin: 0 }}>
                    {d.items.map((item, idx) => (
                      <li key={idx}>
                        {item.product_name} x {item.quantity} - ₱
                        {item.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{d.delivery_status}</td>
                <td>{d.created_at}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary me-1"
                    onClick={() => handleGet(d)}
                  >
                    Get
                  </button>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleUpdateStatus(d)}
                  >
                    Update Status
                  </button>
                </td>
              </tr>
            ))}
            {deliveries.length === 0 && (
              <tr>
                <td colSpan="14" className="text-center">
                  No deliveries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default staffdelivery;
