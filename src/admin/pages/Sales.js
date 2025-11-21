import React, { useState, useContext, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEye,
  faTrash,
  faFilePdf,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ThemeContext } from "../context/themeContext.js";
import axios from "axios";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    productName: "",
    cashierName: "",
  });
  const [selectedCashier, setSelectedCashier] = useState(null);
  const [saleToDelete, setSaleToDelete] = useState(null);

  const { theme, setTheme } = useContext(ThemeContext);

  // ✅ fetch from backend
  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/sales/get");
      setSales(res.data);
    } catch (err) {
      console.error("Error fetching sales:", err);
    }
  };

  // apply theme globally
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleViewCashier = (cashier) => {
    setSelectedCashier(cashier);
    new bootstrap.Modal(document.getElementById("cashierModal")).show();
  };

  const handleDeleteClick = (sale) => {
    setSaleToDelete(sale);
    new bootstrap.Modal(document.getElementById("deleteModal")).show();
  };

  const confirmDelete = () => {
    setSales((prevSales) =>
      prevSales.filter((sale) => sale.id !== saleToDelete.id)
    );
    setSaleToDelete(null);
    bootstrap.Modal.getInstance(document.getElementById("deleteModal")).hide();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          "ID",
          "Customer",
          "Cashier",
          "Payment",
          "Total",
          "Delivery Status",
          "Sale Date",
        ],
      ],
      body: sales.map((item) => [
        item.id,
        item.customer_name,
        item.cashier_name || "N/A",
        item.payment,
        "₱" + item.total,
        item.delivery_status,
        new Date(item.created_at).toLocaleString(),
      ]),
    });
    doc.save("sales_records.pdf");
  };

  const filteredSales = sales.filter(
    (item) =>
      `${item.customer_name} ${item.cashier_name} ${item.delivery_status} ${item.payment} ${item.created_at}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      (filters.cashierName === "" || item.cashier_name === filters.cashierName)
  );

  const uniqueValues = (field) => [
    ...new Set(sales.map((item) => item[field]).filter(Boolean)),
  ];

  return (
    <div
      className="container-fluid p-4 min-vh-100"
      style={{
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Sales Records</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={toggleTheme}>
            {theme === "dark" ? (
              <FontAwesomeIcon icon={faSun} />
            ) : (
              <FontAwesomeIcon icon={faMoon} />
            )}
          </button>
          <button className="btn btn-outline-dark" onClick={handleExportPDF}>
            <FontAwesomeIcon icon={faFilePdf} className="me-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text bg-light">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={filters.cashierName}
            onChange={(e) =>
              setFilters({ ...filters, cashierName: e.target.value })
            }
          >
            <option value="">All Cashiers</option>
            {uniqueValues("cashier_name").map((name, idx) => (
              <option key={idx} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {/* Table */}
      <div className="table-responsive">
        <table className="table table-sm table-bordered align-middle text-center small">
          <thead className="table-light small">
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Cashier</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Delivery Status</th>
              <th>Sale Date</th>
              <th>Items</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length > 0 ? (
              filteredSales.map((item) => (
                <tr key={item.id} className="small">
                  <td>{item.id}</td>
                  <td>{item.customer_name}</td>
                  <td>
                    {item.cashier_name || "N/A"}{" "}
                    <button
                      className="btn btn-sm btn-info ms-2"
                      onClick={() => handleViewCashier(item)} // ✅ pass whole sale (with cashier info)
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  </td>
                  <td>{item.payment}</td>
                  <td>₱{item.total}</td>
                  <td>{item.delivery_status}</td>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                  <td>
                    <table className="table table-sm table-borderless mb-0 small">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.items.map((it, idx) => (
                          <tr key={idx} className="small">
                            <td>{it.product_name}</td>
                            <td>{it.quantity}</td>
                            <td>₱{it.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                <td colSpan="9" className="small">
                  No matching sales found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cashier Modal */}
      <div className="modal fade" id="cashierModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content p-3">
            <div className="modal-header">
              <h5 className="modal-title">Cashier Information</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              {selectedCashier ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <th>ID</th>
                        <td>{selectedCashier.id}</td>
                      </tr>
                      <tr>
                        <th>Name</th>
                        <td>{selectedCashier.name}</td>
                      </tr>

                      <tr>
                        <th>Address</th>
                        <td>{selectedCashier.address}</td>
                      </tr>
                      <tr>
                        <th>Contact</th>
                        <td>{selectedCashier.cashier_contact || "N/A"}</td>
                      </tr>
                      <tr>
                        <th>Email</th>
                        <td>{selectedCashier.cashier_email || "N/A"}</td>
                      </tr>

                      <tr>
                        <th>Birthday</th>
                        <td>
                          {selectedCashier.birthday
                            ? new Date(selectedCashier.birthday)
                                .toISOString()
                                .split("T")[0]
                            : "N/A"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>Loading cashier details...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div className="modal fade" id="deleteModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content p-3">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Deletion</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this sale record?
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
