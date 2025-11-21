// OrdersModal.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OrdersModal = ({ show, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      const fetchOrders = async () => {
        try {
          const response = await axios.get(
            "http://localhost:5000/api/dashboard/orders-report"
          );
          setOrders(response.data);
        } catch (err) {
          console.error("❌ Error fetching orders:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [show]);

  if (!show) return null;
  if (loading) return <p className="text-center mt-5">Loading orders...</p>;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title">📦 Orders Report</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            {orders.length === 0 ? (
              <p className="text-muted text-center">No orders found.</p>
            ) : (
              <table className="table table-hover table-bordered align-middle">
                <thead className="table-dark text-center">
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Delivery Place</th>
                    <th>Receiver</th>
                    <th style={{ width: "35%" }}>Items</th>
                    <th>Total (₱)</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr key={order.id}>
                      <td className="text-center fw-bold">{idx + 1}</td>
                      <td>{order.customer_name || "-"}</td>
                      <td>{order.phone || "-"}</td>
                      <td>{order.delivery_place || "-"}</td>
                      <td>{order.receiver || "-"}</td>

                      <td>
                        {!order.items || order.items.length === 0 ? (
                          <span className="text-muted">No items</span>
                        ) : (
                          <div
                            className="p-2 rounded bg-light border"
                            style={{ maxHeight: "180px", overflowY: "auto" }}
                          >
                            <table className="table table-sm mb-0">
                              <thead className="table-secondary">
                                <tr>
                                  <th style={{ fontSize: "12px" }}>Product</th>
                                  <th style={{ fontSize: "12px" }}>Qty</th>
                                  <th style={{ fontSize: "12px" }}>Price</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items.map((item, i) => (
                                  <tr key={i}>
                                    <td style={{ fontSize: "13px" }}>
                                      {item.product_name || "-"}
                                    </td>
                                    <td
                                      className="text-center"
                                      style={{ fontSize: "13px" }}
                                    >
                                      {item.quantity || "-"}
                                    </td>
                                    <td style={{ fontSize: "13px" }}>
                                      ₱
                                      {item.price
                                        ? parseFloat(item.price).toLocaleString(
                                            "en-PH",
                                            {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            }
                                          )
                                        : "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>

                      <td className="text-end">
                        <span className="badge bg-success fs-6">
                          ₱
                          {parseFloat(order.total || 0).toLocaleString(
                            "en-PH",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="modal-footer d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => {
                onClose();
                navigate("/sales/delivery");
              }}
            >
              Go to Order page here..
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersModal;
