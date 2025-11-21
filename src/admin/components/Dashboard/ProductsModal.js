// ProductsModal.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaBoxOpen } from "react-icons/fa";
import LowStockAlert from "./LowStockAlert.js";
import { useNavigate } from "react-router-dom";

const ProductsModal = ({ show, onClose }) => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      axios
        .get("http://localhost:5000/api/dashboard/products-report")
        .then((res) => setProducts(res.data))
        .catch((err) => console.error("❌ Error fetching products:", err));
    }
  }, [show]);

  if (!show) return null;

  const filteredProducts = products.filter((p) =>
    p.product_name.toLowerCase().includes(search.toLowerCase())
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
              background: "linear-gradient(90deg, #28a745, #56d364)",
            }}
          >
            <h5 className="modal-title d-flex align-items-center gap-2 fw-bold">
              <FaBoxOpen /> Products Report
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body bg-light">
            {/* ✅ Low Stock Warning */}
            <div className="mb-3">
              <LowStockAlert />
            </div>

            {/* ✅ Search Bar */}
            <div className="input-group mb-4 shadow-sm rounded">
              <span className="input-group-text bg-white border-0">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Search product name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* ✅ Products Table */}
            {filteredProducts.length > 0 ? (
              <div className="table-responsive shadow-sm rounded">
                <table className="table table-striped table-hover align-middle mb-0">
                  <thead className="table-success text-center">
                    <tr>
                      <th>#</th>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Monitoring % (1000)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p, index) => {
                      const percentage = Math.min(
                        Math.round((p.quantity / 1000) * 100),
                        100
                      );
                      return (
                        <tr key={index}>
                          <td className="text-center fw-bold">{index + 1}</td>
                          <td className="text-center">
                            {p.image ? (
                              <img
                                src={`http://localhost:5000/uploads/${p.image}`}
                                alt={p.product_name}
                                className="rounded shadow-sm"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <span className="text-muted fst-italic">
                                No image
                              </span>
                            )}
                          </td>
                          <td className="fw-semibold">{p.product_name}</td>
                          <td className="text-success fw-bold">
                            ₱{parseFloat(p.price).toFixed(2)}
                          </td>
                          <td className="fw-bold">{p.quantity}</td>
                          <td style={{ minWidth: "200px" }}>
                            <div
                              className="progress"
                              style={{ height: "20px" }}
                            >
                              <div
                                className={`progress-bar ${
                                  p.quantity < 50
                                    ? "bg-danger"
                                    : p.quantity < 200
                                    ? "bg-warning"
                                    : "bg-success"
                                }`}
                                role="progressbar"
                                style={{
                                  width: `${percentage}%`,
                                  color: "#000",
                                  fontWeight: "600",
                                }}
                                aria-valuenow={percentage}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              >
                                {percentage}%
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted fst-italic">No products found.</p>
            )}
          </div>

          {/* ✅ Footer */}
          <div className="modal-footer border-0">
            <button
              className="btn btn-outline-primary"
              onClick={() => {
                onClose();
                navigate("/stock"); // 👈 go to stock page
              }}
            >
              🚚 Go to Stock Page
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

export default ProductsModal;
