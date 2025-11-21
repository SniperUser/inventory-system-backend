import React, { useState, useContext, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTrash,
  faFilePdf,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ThemeContext } from "../context/themeContext.js";
import axios from "axios";

const Delivery = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deliveryToDelete, setDeliveryToDelete] = useState(null);

  const { theme, setTheme } = useContext(ThemeContext);

  // 🔹 Fetch data from backend
  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/returns/get");
        setDeliveries(res.data);
      } catch (err) {
        console.error("❌ Error fetching returns:", err);
      }
    };
    fetchReturns();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleDeleteClick = (delivery) => {
    setDeliveryToDelete(delivery);
    new bootstrap.Modal(document.getElementById("deleteModal")).show();
  };

  const confirmDelete = () => {
    setDeliveries((prev) => prev.filter((d) => d.id !== deliveryToDelete.id));
    setDeliveryToDelete(null);
    bootstrap.Modal.getInstance(document.getElementById("deleteModal")).hide();
  };

  // 🔹 Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          "ID",
          "Customer",
          "Products",
          "Contact",
          "Address",
          "Total Price",
          "Delivery Status",
          "Return Reason",
          "Delivery Person",
          "Date",
        ],
      ],
      body: deliveries.map((item) => [
        item.id,
        item.customer_name,
        Array.isArray(item.items)
          ? item.items
              .map((p) => `${p.product_name} (x${p.quantity})`)
              .join(", ")
          : "—",
        item.phone,
        item.address,
        "₱" + Number(item.total || 0).toLocaleString(),
        item.delivery_status,
        item.reason || "—",
        item.delivery_person_fullname || "—",
        item.created_at
          ? new Date(item.created_at).toLocaleDateString("en-CA")
          : "—",
      ]),
    });
    doc.save("returns.pdf");
  };

  // 🔹 Filter deliveries
  const filteredDeliveries = deliveries.filter((item) =>
    `${item.id} ${item.customer_name} ${item.phone} ${item.address} ${
      item.reason
    } ${(item.items || []).map((p) => p.product_name).join(" ")}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="container-fluid p-4 min-vh-100"
      style={{
        fontSize: "13px",
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
      }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Returned Management</h4>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              borderColor: "var(--border-color)",
              color: "var(--text-color)",
            }}
          >
            {theme === "dark" ? (
              <FontAwesomeIcon icon={faSun} />
            ) : (
              <FontAwesomeIcon icon={faMoon} />
            )}
          </button>
          <button
            className="btn btn-outline-light"
            onClick={handleExportPDF}
            style={{
              borderColor: "var(--border-color)",
              color: "var(--text-color)",
              backgroundColor: "transparent",
            }}
          >
            <FontAwesomeIcon icon={faFilePdf} className="me-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="row mb-3 g-2">
        <div className="col-md-4">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-light">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search returns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
                border: "1px solid var(--border-color)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table
          className="table table-bordered table-sm text-center align-middle"
          style={{
            backgroundColor: "var(--bg-color)",
            color: "var(--text-color)",
          }}
        >
          <thead style={{ fontSize: "12px" }}>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Contact</th>
              <th>Address</th>
              <th>Total</th>
              <th>Status</th>
              <th>Return Reason</th>
              <th>Delivery Person</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.customer_name}</td>
                  <td className="text-start">
                    {Array.isArray(item.items) && item.items.length > 0 ? (
                      <table className="table table-sm mb-0">
                        <thead>
                          <tr>
                            <th style={{ fontSize: "12px" }}>Name</th>
                            <th style={{ fontSize: "12px" }}>Qty</th>
                            <th style={{ fontSize: "12px" }}>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.items.map((p, i) => (
                            <tr key={i}>
                              <td>{p.product_name}</td>
                              <td>{p.quantity}</td>
                              <td>₱{Number(p.price || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <span>—</span>
                    )}
                  </td>

                  <td>{item.phone}</td>
                  <td>{item.address}</td>
                  <td>₱{Number(item.total || 0).toLocaleString()}</td>
                  <td>
                    {item.delivery_status === "returned" ? (
                      <span className="badge bg-danger">Returned</span>
                    ) : item.delivery_status === "delivered" ? (
                      <span className="badge bg-success">Delivered</span>
                    ) : (
                      <span className="badge bg-warning text-dark">
                        {item.delivery_status}
                      </span>
                    )}
                  </td>
                  <td>{item.reason || "—"}</td>
                  <td>{item.delivery_person_fullname || "—"}</td>
                  <td>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString("en-CA")
                      : "—"}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteClick(item)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11">No return records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Delivery;
