// DeliveriesModal.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaTruck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DeliveriesModal = ({ show, onClose }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const Navigate = useNavigate();

  useEffect(() => {
    if (show) {
      const fetchDeliveries = async () => {
        try {
          const res = await axios.get(
            "http://localhost:5000/api/dashboard/deliveries-report"
          );
          setDeliveries(res.data);
        } catch (err) {
          console.error("❌ Error fetching deliveries:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchDeliveries();
    }
  }, [show]);

  if (!show) return null;

  const filteredDeliveries = deliveries.filter(
    (d) =>
      d.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      (d.rider_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content shadow-lg rounded-4 border-0">
          {/* ✅ Header */}
          <div
            className="modal-header text-white"
            style={{
              background: "linear-gradient(90deg, #007bff, #66b2ff)",
            }}
          >
            <h5 className="modal-title d-flex align-items-center gap-2 fw-bold">
              <FaTruck /> Deliveries Report
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body bg-light">
            {/* ✅ Search Bar */}
            <div className="input-group mb-4 shadow-sm rounded">
              <span className="input-group-text bg-white border-0">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Search by customer or rider..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* ✅ Deliveries Table */}
            {loading ? (
              <p className="text-center text-muted fst-italic">Loading...</p>
            ) : filteredDeliveries.length > 0 ? (
              <div className="table-responsive shadow-sm rounded small">
                <table className="table table-sm table-striped table-hover align-middle mb-0">
                  <thead className="table-primary text-center">
                    <tr>
                      <th>#</th>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Receiver</th>
                      <th>Place</th>
                      <th>Address</th>
                      <th>Type</th>
                      <th>Payment</th>
                      <th>Pay Status</th>
                      <th>Total</th>
                      <th>Ship Fee</th>
                      <th>Status</th>
                      <th>Rider</th>
                      <th>Items</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeliveries.map((d, index) => (
                      <tr key={d.id} className="small">
                        <td className="text-center fw-bold py-1 px-2">
                          {index + 1}
                        </td>
                        <td className="py-1 px-2">{d.customer_name}</td>
                        <td className="py-1 px-2">{d.phone}</td>
                        <td className="py-1 px-2">{d.receiver}</td>
                        <td className="py-1 px-2">{d.delivery_place}</td>
                        <td className="py-1 px-2">{d.address}</td>
                        <td className="py-1 px-2">{d.delivery_type}</td>
                        <td className="py-1 px-2">{d.payment}</td>
                        <td className="py-1 px-2">{d.payment_status}</td>
                        <td className="text-success fw-bold py-1 px-2">
                          ₱{parseFloat(d.total).toFixed(2)}
                        </td>
                        <td className="fw-bold py-1 px-2">
                          ₱{parseFloat(d.shipping_fee).toFixed(2)}
                        </td>
                        <td className="py-1 px-2">{d.delivery_status}</td>
                        <td className="py-1 px-2">{d.rider_name || "N/A"}</td>
                        <td className="py-1 px-2">
                          {Array.isArray(d.items) && d.items.length > 0 ? (
                            <table className="table table-sm table-bordered small mb-0">
                              <thead className="table-secondary">
                                <tr>
                                  <th>Product</th>
                                  <th>Qty</th>
                                  <th>Price</th>
                                </tr>
                              </thead>
                              <tbody>
                                {d.items.map((item, i) => (
                                  <tr key={i}>
                                    <td className="py-1 px-2">
                                      {item.product_name}
                                    </td>
                                    <td className="py-1 px-2">
                                      {item.quantity}
                                    </td>
                                    <td className="py-1 px-2">₱{item.price}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <span className="text-muted fst-italic">
                              No items
                            </span>
                          )}
                        </td>
                        <td className="py-1 px-2">
                          {new Date(d.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted fst-italic">No deliveries found.</p>
            )}
          </div>

          {/* ✅ Footer */}
          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-outline-primary px-4"
              onClick={() => {
                onClose();
                Navigate("/sales/delivery");
              }}
            >
              Go to Deliveries Page
            </button>
            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveriesModal;
