// ReturnsModal.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaUndo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ReturnsModal = ({ show, onClose }) => {
  const [returns, setReturns] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      const fetchReturns = async () => {
        try {
          const res = await axios.get(
            "http://localhost:5000/api/dashboard/return-sales-report"
          );

          // ✅ no JSON.parse needed, backend already parsed items
          const formatted = res.data.map((row) => {
            const items = Array.isArray(row.items) ? row.items : [];
            return {
              ...row,
              items: items.map((item) => ({
                ...item,
                quantity: item.quantity ?? item.qty ?? item.amount ?? 0,
              })),
            };
          });

          setReturns(formatted);
        } catch (err) {
          console.error("❌ Error fetching returns:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchReturns();
    }
  }, [show]);

  if (!show) return null;

  const filteredReturns = returns.filter(
    (r) =>
      r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.delivery_person_name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
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
              background: "linear-gradient(90deg, #dc3545, #ff6b6b)",
            }}
          >
            <h5 className="modal-title d-flex align-items-center gap-2 fw-bold">
              <FaUndo /> Returned Deliveries
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

            {/* ✅ Returns Table */}
            {loading ? (
              <p className="text-center text-muted fst-italic">Loading...</p>
            ) : filteredReturns.length > 0 ? (
              <div className="table-responsive shadow-sm rounded small">
                <table className="table table-sm table-striped table-hover align-middle mb-0">
                  <thead className="table-danger text-center">
                    <tr>
                      <th>#</th>
                      <th>Delivery ID</th>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Receiver</th>
                      <th>Place</th>
                      <th>Address</th>
                      <th>Payment</th>
                      <th>Pay Status</th>
                      <th>Delivery Status</th>
                      <th>Ship Fee</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Reason</th>
                      <th>Delivery Person</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReturns.map((r, index) => (
                      <tr key={r.id} className="small">
                        <td className="text-center fw-bold py-1 px-2">
                          {index + 1}
                        </td>
                        <td className="py-1 px-2">{r.delivery_id}</td>
                        <td className="py-1 px-2">{r.customer_name}</td>
                        <td className="py-1 px-2">{r.phone}</td>
                        <td className="py-1 px-2">{r.receiver}</td>
                        <td className="py-1 px-2">{r.delivery_place}</td>
                        <td className="py-1 px-2">{r.address}</td>
                        <td className="py-1 px-2">{r.payment}</td>
                        <td className="py-1 px-2">{r.payment_status}</td>
                        <td className="py-1 px-2">{r.delivery_status}</td>
                        <td className="fw-bold py-1 px-2">
                          ₱{parseFloat(r.shipping_fee).toFixed(2)}
                        </td>
                        <td className="py-1 px-2">
                          {r.items.length > 0 ? (
                            <table className="table table-sm table-bordered small mb-0">
                              <thead className="table-secondary">
                                <tr>
                                  <th>Product</th>
                                  <th>Qty</th>
                                  <th>Price</th>
                                </tr>
                              </thead>
                              <tbody>
                                {r.items.map((item, i) => (
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
                        <td className="text-success fw-bold py-1 px-2">
                          ₱{parseFloat(r.total).toFixed(2)}
                        </td>
                        <td className="text-danger fw-bold py-1 px-2">
                          {r.reason}
                        </td>
                        <td className="py-1 px-2">
                          {r.delivery_person_name || "N/A"}
                        </td>
                        <td className="py-1 px-2">
                          {new Date(r.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted fst-italic">No returns found.</p>
            )}
          </div>

          {/* ✅ Footer */}
          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-outline-primary px-4"
              onClick={() => {
                onClose();
                navigate("/sales/return");
              }}
            >
              Go to return page here..
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

export default ReturnsModal;
