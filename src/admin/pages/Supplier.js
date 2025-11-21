import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faPlus,
  faPen,
  faTrash,
  faFilePdf,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ThemeContext } from "../context/themeContext.js";

const Supplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    product: "",
    contact: "",
    phone: "",
    address: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [addingSupplier, setAddingSupplier] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const toastRef = useRef(null);
  const { theme, setTheme } = useContext(ThemeContext);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/supplier/suppliers/all"
      );
      setSuppliers(res.data);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      showToast("Failed to fetch suppliers.", "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    const toastEl = toastRef.current;
    if (toastEl) {
      toastEl.classList.remove("show");
      void toastEl.offsetWidth;
      new bootstrap.Toast(toastEl).show();
    }
  };

  const openModal = (edit = false, data = null) => {
    setIsEditing(edit);
    setFormData(
      data || {
        id: null,
        name: "",
        product: "",
        contact: "",
        phone: "",
        address: "",
      }
    );
    const el = document.getElementById("supplierModal");
    if (el) {
      new bootstrap.Modal(el).show();
    }
  };

  const closeModal = () => {
    const el = document.getElementById("supplierModal");
    if (el) {
      const modal = bootstrap.Modal.getInstance(el);
      if (modal) modal.hide();
    }
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    const el = document.getElementById("deleteSupplierModal");
    if (el) {
      new bootstrap.Modal(el).show();
    }
  };

  const closeDeleteModal = () => {
    const el = document.getElementById("deleteSupplierModal");
    if (el) {
      const modal = bootstrap.Modal.getInstance(el);
      if (modal) modal.hide();
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.product.trim()) {
      showToast("Name and product are required.", "error");
      return;
    }

    // Prevent double/triple request
    if (addingSupplier) return;
    setAddingSupplier(true);

    try {
      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/supplier/update/supplier/${formData.id}`,
          formData
        );
        showToast("Supplier updated successfully.");
        setSuppliers((prev) =>
          prev.map((s) =>
            s.id === formData.id ? { ...s, ...formData } : s
          )
        );
      } else {
        // Client-side duplicate check (by name + product)
        const nameNorm = formData.name.trim().toLowerCase();
        const productNorm = formData.product.trim().toLowerCase();
        if (
          suppliers.some(
            (s) =>
              s.name?.trim().toLowerCase() === nameNorm &&
              s.product?.trim().toLowerCase() === productNorm
          )
        ) {
          showToast("Supplier with that name and product already exists.", "error");
          return;
        }

        const res = await axios.post(
          "http://localhost:5000/api/supplier/add/suppliers",
          formData
        );

        showToast("Supplier added successfully.");

        // If API returns the created supplier object, append it; else refetch once.
        if (res.data && (res.data.id || res.data.supplier_id)) {
          const created = {
            id: res.data.id ?? res.data.supplier_id,
            name: formData.name,
            product: formData.product,
            contact: formData.contact,
            phone: formData.phone,
            address: formData.address,
            created_at: res.data.created_at || new Date().toISOString(),
          };
          setSuppliers((prev) => {
            if (prev.some((s) => String(s.id) === String(created.id))) return prev;
            return [...prev, created];
          });
        } else {
          // fallback: refresh list
          await fetchSuppliers();
        }
      }
      closeModal();
    } catch (err) {
      console.error("Error saving supplier:", err);
      showToast("Failed to save supplier.", "error");
    } finally {
      setAddingSupplier(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/supplier/deleted/supplier/${deleteId}`
      );
      showToast("Supplier deleted (archived).");
      await fetchSuppliers();
      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting supplier:", err);
      showToast("Failed to delete supplier.", "error");
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch = Object.values(s)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesName = filterName ? s.name === filterName : true;
    const matchesProduct = filterProduct ? s.product === filterProduct : true;
    return matchesSearch && matchesName && matchesProduct;
  });

  const uniqueNames = [...new Set(suppliers.map((s) => s.name))];
  const uniqueProducts = [...new Set(suppliers.map((s) => s.product))];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["ID", "Name", "Product", "Contact", "Phone", "Address", "Created At"]],
      body: filteredSuppliers.map((s) => [
        s.id,
        s.name,
        s.product,
        s.contact,
        s.phone,
        s.address,
        s.created_at ? new Date(s.created_at).toLocaleDateString() : "—",
      ]),
      styles: { halign: "left" },
    });
    doc.save("suppliers.pdf");
  };

  return (
    <div
      className="container-fluid p-3"
      style={{
        fontSize: "0.9rem",
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
      }}
    >
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h2 className="mb-0">Supplier Management</h2>
          <small style={{ color: "var(--text-color)" }}>
            Manage your suppliers and export data
          </small>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              borderColor: "var(--border-color)",
              backgroundColor: "transparent",
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
              backgroundColor: "transparent",
              color: "var(--text-color)",
            }}
          >
            <FontAwesomeIcon icon={faFilePdf} className="me-1" /> Export PDF
          </button>
          <button
            className="btn btn-success"
            onClick={() => openModal(false)}
            title="Add Supplier"
          >
            <FontAwesomeIcon icon={faPlus} /> Add Supplier
          </button>
        </div>
      </div>

      {/* Filters / Search */}
      <div className="row g-2 mb-3">
        <div className="col-md-4 position-relative">
          <input
            className="form-control ps-5"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
              border: "1px solid var(--border-color)",
            }}
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="position-absolute top-50 start-0 translate-middle-y ms-3"
            style={{ color: "var(--searchicon-color)", zIndex: 1 }}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
              border: "1px solid var(--border-color)",
            }}
          >
            <option value="">All Names</option>
            {uniqueNames.map((n, i) => (
              <option key={i} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
              border: "1px solid var(--border-color)",
            }}
          >
            <option value="">All Products</option>
            {uniqueProducts.map((p, i) => (
              <option key={i} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table
          className="table table-bordered table-hover"
          style={{
            backgroundColor: "var(--bg-color)",
            color: "var(--text-color)",
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Supplier Name</th>
              <th>Product</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Date Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length ? (
              filteredSuppliers.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.product}</td>
                  <td>{s.contact}</td>
                  <td>{s.phone}</td>
                  <td>{s.address}</td>
                  <td>
                    {s.created_at
                      ? new Date(s.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => openModal(true, s)}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => openDeleteModal(s.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center">
                  No suppliers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Supplier Modal */}
      <div className="modal fade" id="supplierModal" tabIndex={-1}>
        <div className="modal-dialog">
          <div
            className="modal-content p-4"
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
            }}
          >
            <h5>{isEditing ? "Edit Supplier" : "Add Supplier"}</h5>
            <div className="mb-2">
              <label className="form-label">Supplier Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Supplier Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                style={{
                  backgroundColor: "var(--bg-color)",
                  color: "var(--text-color)",
                  border: "1px solid var(--border-color)",
                }}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Product</label>
              <input
                type="text"
                className="form-control"
                placeholder="Product"
                value={formData.product}
                onChange={(e) =>
                  setFormData({ ...formData, product: e.target.value })
                }
                style={{
                  backgroundColor: "var(--bg-color)",
                  color: "var(--text-color)",
                  border: "1px solid var(--border-color)",
                }}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Contact Person</label>
              <input
                type="text"
                className="form-control"
                placeholder="Contact Person"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                style={{
                  backgroundColor: "var(--bg-color)",
                  color: "var(--text-color)",
                  border: "1px solid var(--border-color)",
                }}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                style={{
                  backgroundColor: "var(--bg-color)",
                  color: "var(--text-color)",
                  border: "1px solid var(--border-color)",
                }}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                style={{
                  backgroundColor: "var(--bg-color)",
                  color: "var(--text-color)",
                  border: "1px solid var(--border-color)",
                }}
              />
            </div>
            <div className="d-flex justify-content-end mt-3">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSave}
                disabled={addingSupplier}
              >
                {addingSupplier
                  ? isEditing
                    ? "Updating..."
                    : "Saving..."
                  : isEditing
                  ? "Update"
                  : "Add"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div className="modal fade" id="deleteSupplierModal" tabIndex={-1}>
        <div className="modal-dialog">
          <div
            className="modal-content p-4"
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
            }}
          >
            <h5>Confirm Delete</h5>
            <p>Are you sure you want to delete this supplier?</p>
            <div className="d-flex justify-content-end mt-3">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div
        ref={toastRef}
        className={`toast fade position-fixed top-50 start-50 translate-middle ${
          toastType === "error" ? "bg-danger" : "bg-success"
        } text-white`}
        style={{ zIndex: 9999 }}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body text-center w-100">
            {toastMessage}
          </div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            onClick={() => {
              if (toastRef.current) toastRef.current.classList.remove("show");
            }}
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  );
};

export default Supplier;
