// src/FrontendPOS/components/PaymentStatus.js
import React, { useState, useEffect } from "react";

const PaymentStatus = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch all payment statuses
  const fetchOrders = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/cashiering/payment-status"
      );
      const data = await res.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching payment statuses:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await fetch("http://localhost:5000/api/cashiering/payment-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, payment_status: newStatus }),
      });
      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, payment_status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Error updating payment status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p>Loading payment status...</p>;

  return (
    <div className="payment-status-table">
      <h3>Payment Status</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer Name</th>
            <th>Payment Status</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer_name || "-"}</td>
              <td>{order.payment_status || "pending"}</td>
              <td>
                <select
                  value={order.payment_status || "pending"}
                  disabled={updatingId === order.id}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentStatus;
