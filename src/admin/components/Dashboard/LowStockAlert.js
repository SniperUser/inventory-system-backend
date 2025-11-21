// LowStockAlert.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaExclamationTriangle } from "react-icons/fa";

const LowStockAlert = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboard/products-report")
      .then((res) => {
        // ✅ Filter only products below 50
        const filtered = res.data.filter((p) => p.quantity < 50);
        setLowStockProducts(filtered);
      })
      .catch((err) => {
        console.error("❌ Error fetching low stock products:", err);
      });
  }, []);

  if (lowStockProducts.length === 0) return null;

  return (
    <div
      className="position-relative d-inline-block"
      onMouseEnter={() => setShowList(true)}
      onMouseLeave={() => setShowList(false)}
    >
      {/* ✅ Small notification badge */}
      <span
        className="badge bg-warning text-dark d-flex align-items-center justify-content-center"
        style={{
          fontSize: "0.65rem", // smaller font
          padding: "2px 5px", // tighter padding
          borderRadius: "50px", // pill shape
          minWidth: "22px",
          cursor: "pointer",
        }}
      >
        <FaExclamationTriangle
          style={{ fontSize: "0.7rem", marginRight: "3px" }}
        />
        {lowStockProducts.length}
      </span>

      {/* ✅ Hover list with product names */}
      {showList && (
        <div
          className="position-absolute bg-white border rounded shadow p-2"
          style={{
            top: "120%",
            left: "0",
            zIndex: 1000,
            minWidth: "220px",
            fontSize: "0.8rem",
            color: "black",
          }}
        >
          <strong>Low Stock Items:</strong>
          <div className="mt-1">
            {lowStockProducts.map((p, idx) => (
              <span key={p.id}>
                {p.product_name} (Qty: {p.quantity})
                {idx < lowStockProducts.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockAlert;
