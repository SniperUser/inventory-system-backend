import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashRestore,
  faTrashAlt,
  faSearch,
  faFilePdf,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ThemeContext } from "../context/themeContext.js";

export default function ArchivePage() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [type, setType] = useState("stock");
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  const { theme, setTheme } = useContext(ThemeContext);

  const confirmModalRef = useRef(null);
  const successModalRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchArchivedItems(type);
  }, [type]);

  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, items]);

  const fetchArchivedItems = async (selectedType) => {
    let endpoint = "";
    if (selectedType === "stock") endpoint = "archived/stock";
    else if (selectedType === "employee") endpoint = "archived/employee";
    else if (selectedType === "supplier") endpoint = "archived/supplier";

    try {
      const res = await axios.get(
        `http://localhost:5000/api/stock/${endpoint}`
      );
      setItems(res.data);
      setFilteredItems(res.data);
      setErrorMessage("");
    } catch (err) {
      console.error("❌ Error fetching archive:", err);
      setItems([]);
      setFilteredItems([]);
      setErrorMessage(
        `⚠️ Archive for "${selectedType}" is not supported (backend not implemented).`
      );
    }
  };

  const applySearchFilter = () => {
    const filtered = items.filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const openConfirmModal = (action, id) => {
    setPendingAction(action);
    setPendingId(id);

    setModalTitle(
      action === "restore" ? "Restore Confirmation" : "Delete Confirmation"
    );
    setModalMessage(
      action === "restore"
        ? "Are you sure you want to restore this record?"
        : "Are you sure you want to permanently delete this record?"
    );

    const modalEl = confirmModalRef.current;
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  };

  const handleConfirm = async () => {
    if (!pendingId || !pendingAction) return;

    try {
      if (pendingAction === "restore") {
        await restoreItem(pendingId);
      } else if (pendingAction === "delete") {
        await deleteItem(pendingId);
      }
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  const restoreItem = async (id) => {
    let endpoint = "";
    if (type === "stock") endpoint = `archived/restore/stock/${id}`;
    else if (type === "employee") endpoint = `archived/restore/employee/${id}`;
    else if (type === "supplier") endpoint = `archived/restore/supplier/${id}`;

    try {
      await axios.put(`http://localhost:5000/api/archived/${endpoint}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
      showSuccessModal(
        "✅ Restored",
        `${capitalize(type)} restored successfully.`
      );
    } catch (err) {
      console.error("❌ Error restoring item:", err);
    }
  };

  const deleteItem = async (id) => {
    let endpoint = "";
    if (type === "stock") endpoint = `archived/delete/stock/${id}`;
    else if (type === "employee") endpoint = `archived/delete/employee/${id}`;
    else if (type === "supplier") endpoint = `archived/delete/supplier/${id}`;

    try {
      await axios.delete(`http://localhost:5000/api/stock/${endpoint}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
      showSuccessModal(
        "🗑️ Deleted",
        `${capitalize(type)} deleted permanently.`
      );
    } catch (err) {
      console.error("❌ Error deleting item:", err);
    }
  };

  const showSuccessModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    const modalEl = successModalRef.current;
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
      setTimeout(() => modal.hide(), 2000);
    }
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    let head = [];
    let body = [];

    if (type === "stock") {
      head = [
        [
          "ID",
          "Product Name",
          "Description",
          "Price",
          "Quantity",
          "Category",
          "Brand", // ✅ Added
          "Supplier ID",
          "Created At",
        ],
      ];
      body = filteredItems.map((item) => [
        item.id,
        item.product_name,
        item.description,
        item.price,
        item.quantity,
        item.category,
        item.brand || "", // ✅ Added
        item.supplier_id,
        item.created_at,
      ]);
    } else if (type === "employee") {
      head = [
        [
          "Name",
          "Position",
          "Active",
          "Address",
          "Contact",
          "Email",
          "Role",
          "Created At",
        ],
      ];
      body = filteredItems.map((item) => [
        item.name,
        item.position,
        item.isActive ? "Yes" : "No",
        item.address,
        item.contact,
        item.email,
        item.role,
        item.created_at,
      ]);
    } else if (type === "supplier") {
      head = [["Name", "Address", "Contact", "Created At"]];
      body = filteredItems.map((item) => [
        item.name,
        item.address,
        item.contact,
        item.created_at,
      ]);
    }

    autoTable(doc, {
      head,
      body,
      styles: { halign: "left", fontSize: 8 },
      headStyles: { fillColor: [220, 220, 220] },
    });

    doc.save(`archived_${type}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const renderTableHeaders = () => {
    switch (type) {
      case "stock":
        return (
          <>
            <th>ID</th>
            <th>Image</th>
            <th>Product Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Category</th>
            <th>Brand</th> {/* ✅ Added */}
            <th>Supplier ID</th>
            <th>Created At</th>
            <th>Actions</th>
          </>
        );
      case "employee":
        return (
          <>
            <th>Name</th>
            <th>Position</th>
            <th>Active</th>
            <th>Address</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created At</th>
            <th>Actions</th>
          </>
        );
      case "supplier":
        return (
          <>
            <th>Name</th>
            <th>Address</th>
            <th>Contact</th>
            <th>Created At</th>
            <th>Actions</th>
          </>
        );
      default:
        return null;
    }
  };

  const renderTableRows = () =>
    filteredItems.length ? (
      filteredItems.map((item) => (
        <tr key={item.id}>
          {type === "stock" && (
            <>
              <td>{item.id}</td>
              <td>
                {item.image ? (
                  <img
                    src={`http://localhost:5000/uploads/${item.image}`}
                    alt="Product"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  "No Image"
                )}
              </td>
              <td>{item.product_name}</td>
              <td>{item.description}</td>
              <td>{item.price}</td>
              <td>{item.quantity}</td>
              <td>{item.category}</td>
              <td>{item.brand}</td> {/* ✅ Added */}
              <td>{item.supplier_id}</td>
              <td>{item.created_at}</td>
            </>
          )}
          {type === "employee" && (
            <>
              <td>{item.name}</td>
              <td>{item.position}</td>
              <td>{item.isActive ? "Yes" : "No"}</td>
              <td>{item.address}</td>
              <td>{item.contact}</td>
              <td>{item.email}</td>
              <td>{item.role}</td>
              <td>{item.created_at}</td>
            </>
          )}
          {type === "supplier" && (
            <>
              <td>{item.name}</td>
              <td>{item.address}</td>
              <td>{item.contact}</td>
              <td>{item.created_at}</td>
            </>
          )}
          <td>
            <button
              className="btn btn-sm btn-success me-2"
              onClick={() => openConfirmModal("restore", item.id)}
              aria-label="Restore"
            >
              <FontAwesomeIcon icon={faTrashRestore} />
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => openConfirmModal("delete", item.id)}
              aria-label="Delete"
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="11" className="text-center text-muted">
          No archived records found.
        </td>
      </tr>
    );

  return (
    <div
      className="container mt-4 p-4 rounded"
      style={{
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
        minHeight: "80vh",
      }}
    >
      <div className="mb-3">
        <h3 style={{ color: "var(--text-color)" }}>Archived Records</h3>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="input-group" style={{ minWidth: 200, maxWidth: 300 }}>
            <span
              className="input-group-text"
              style={{
                backgroundColor: "var(--secondary-bg)",
                color: "var(--secondary-text)",
              }}
            >
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="form-control"
              style={{
                backgroundColor: "var(--secondary-bg)",
                color: "var(--secondary-text)",
                borderColor: "var(--border-color)",
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search archived records"
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={toggleTheme}
              className="btn"
              aria-label="Toggle theme"
              style={{
                minWidth: 40,
                backgroundColor: "var(--button-bg)",
                color: "var(--button-text)",
                borderColor: "var(--border-color)",
              }}
            >
              {theme === "dark" ? (
                <FontAwesomeIcon icon={faSun} />
              ) : (
                <FontAwesomeIcon icon={faMoon} />
              )}
            </button>

            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="Select archive type"
              style={{
                maxWidth: 150,
                backgroundColor: "var(--secondary-bg)",
                color: "var(--secondary-text)",
                borderColor: "var(--border-color)",
              }}
            >
              <option value="stock">📦 Stock</option>
              <option value="employee">👤 Employee</option>
              <option value="supplier">🏢 Supplier</option>
            </select>

            <button
              className="btn"
              onClick={exportPDF}
              aria-label="Export to PDF"
              style={{
                whiteSpace: "nowrap",
                backgroundColor: "var(--button-bg)",
                color: "var(--button-text)",
                borderColor: "var(--border-color)",
              }}
            >
              <FontAwesomeIcon icon={faFilePdf} className="me-1" /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="alert alert-warning text-center">{errorMessage}</div>
      ) : (
        <div className="table-responsive">
          <table
            className="table table-bordered table-hover align-middle"
            style={{
              backgroundColor: "var(--table-bg)",
              color: "var(--text-color)",
            }}
          >
            <thead className="table-secondary text-dark">
              <tr>{renderTableHeaders()}</tr>
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        </div>
      )}

      {/* Confirm Modal */}
      <div
        className="modal fade"
        tabIndex="-1"
        aria-hidden="true"
        ref={confirmModalRef}
        id="confirmModal"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-secondary text-white">
            <div className="modal-header">
              <h5 className="modal-title">{modalTitle}</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">{modalMessage}</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirm}
                data-bs-dismiss="modal"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <div
        className="modal fade"
        tabIndex="-1"
        aria-hidden="true"
        ref={successModalRef}
        id="successModal"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-success text-white">
            <div className="modal-header">
              <h5 className="modal-title">{modalTitle}</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">{modalMessage}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
