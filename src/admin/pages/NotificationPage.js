// NotificationPage.js
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { FaExclamationTriangle } from "react-icons/fa";
import { ThemeContext } from "../context/themeContext.js";

function NotificationPage() {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboard/products-report")
      .then((res) => {
        const filtered = res.data.filter((p) => p.quantity < 50);
        setLowStockProducts(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching low stock products:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div
      className="container mt-5"
      style={{
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
        minHeight: "80vh",
        padding: "20px",
        borderRadius: "8px",
      }}
    >
      <h2 className="mb-3 d-flex align-items-center">
        <FaExclamationTriangle className="text-warning me-2" />
        Low Stock Notifications
      </h2>
      <p className="" style={{ color: "var(--text-color)" }}>
        These products are running low (below <strong>50 units</strong>).
      </p>

      {loading ? (
        <div className="alert alert-info">Loading notifications...</div>
      ) : lowStockProducts.length === 0 ? (
        <div className="alert alert-success">
          ✅ All products are sufficiently stocked!
        </div>
      ) : (
        <div className="table-responsive">
          <table
            className="table table-bordered table-hover shadow-sm"
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
            }}
          >
            <thead className="table-warning">
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((product, idx) => (
                <tr key={product.id}>
                  <td>{idx + 1}</td>
                  <td>{product.product_name}</td>
                  <td>
                    <span className="badge bg-danger">{product.quantity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default NotificationPage;
