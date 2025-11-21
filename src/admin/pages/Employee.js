import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
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

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    birthday: "",
    position: "",
    isActive: true,
    address: "",
    contact: "",
    email: "",
    role: "",
    username: "",
    password: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const toastRef = useRef(null);
  const [employeeImages, setEmployeeImages] = useState({}); // { [id]: blobUrl or fallback }
  const { theme, setTheme } = useContext(ThemeContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const fallbackImage = "/default-user.png";

  // Consolidated login status and initial fetch
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const logged = !!user;
    setIsLoggedIn(logged);
    if (logged) {
      getAllEmployees();
    }
  }, []);

  // Apply theme attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Auto-hide any modals on mount (cleanup stale)
  useEffect(() => {
    const employeeModalEl = document.getElementById("employeeModal");
    const deleteModalEl = document.getElementById("deleteModal");

    if (employeeModalEl && employeeModalEl.classList.contains("show")) {
      const modal = bootstrap.Modal.getInstance(employeeModalEl);
      modal?.hide();
    }

    if (deleteModalEl && deleteModalEl.classList.contains("show")) {
      const modal = bootstrap.Modal.getInstance(deleteModalEl);
      modal?.hide();
    }
  }, []);

  // Poll employees every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isLoggedIn) getAllEmployees();
    }, 10000); // 10 seconds

    return () => clearInterval(intervalId);
  }, [isLoggedIn]);

  const getAllEmployees = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/employee/employees/all"
      );
      setEmployees(res.data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      showToast("Failed to fetch employees.", "error");
    }
  };

  // Image loader per employee with caching
  const loadImageFor = useCallback(
    async (id) => {
      if (employeeImages[id]) return; // already fetched (success or fallback)

      try {
        const response = await fetch(
          `http://localhost:5000/api/employee/employees/${id}/image`
        );
        if (!response.ok) throw new Error("Image not found");
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setEmployeeImages((prev) => ({ ...prev, [id]: blobUrl }));
      } catch (err) {
        console.warn(`⚠️ Fallback image used for employee ${id}`);
        setEmployeeImages((prev) => ({ ...prev, [id]: fallbackImage }));
      }
    },
    [employeeImages]
  );

  // Whenever employees list updates, ensure their images are loaded
  useEffect(() => {
    employees.forEach((emp) => {
      if (emp?.id) loadImageFor(emp.id);
    });
  }, [employees, loadImageFor]);

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    const toastEl = toastRef.current;
    if (toastEl) {
      toastEl.classList.remove("show");
      void toastEl.offsetWidth;
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  };

  const openModal = (edit = false, data = null) => {
    setIsEditing(edit);
    setFormData(
      data || {
        id: null,
        name: "",
        birthday: "",
        position: "",
        isActive: true,
        address: "",
        contact: "",
        email: "",
        role: "",
      }
    );
    const modal = new bootstrap.Modal(
      document.getElementById("employeeModal")
    );
    modal.show();
  };

  const closeModal = () => {
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("employeeModal")
    );
    if (modal) modal.hide();
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    const modal = new bootstrap.Modal(
      document.getElementById("deleteModal")
    );
    modal.show();
  };

  const closeDeleteModal = () => {
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("deleteModal")
    );
    if (modal) modal.hide();
  };

  const isFormValid = () => {
    const requiredFields = [
      "name",
      "birthday",
      "position",
      "address",
      "contact",
      "email",
      "role",
    ];
    return requiredFields.every(
      (field) => formData[field]?.toString().trim() !== ""
    );
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    try {
      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/employee/update/employee/${formData.id}`,
          formData
        );
        showToast("Employee updated successfully.");

        setEmployees((prevEmployees) =>
          prevEmployees.map((emp) =>
            emp.id === formData.id ? { ...emp, ...formData } : emp
          )
        );
      } else {
        // Client-side duplicate name guard (case-insensitive, trimmed)
        const newNameNorm = formData.name.trim().toLowerCase();
        const duplicate = employees.some(
          (e) => e.name?.trim().toLowerCase() === newNameNorm
        );
        if (duplicate) {
          showToast(
            "Cannot duplicate employee entry: name already exists.",
            "error"
          );
          return;
        }

        const newEmployeeData = {
          ...formData,
          isActive: false,
          name: formData.name.trim(),
        };

        const res = await axios.post(
          "http://localhost:5000/api/employee/add/employee",
          newEmployeeData
        );

        const { username, password, emailSent } = res.data;

        let msg = `Employee added!\nUsername: ${username}\nPassword: ${password}`;
        if (emailSent === false) {
          msg += `\n⚠️ But email failed to send.`;
        }

        showToast(msg);
        await getAllEmployees();
      }

      closeModal();
    } catch (error) {
      console.error(error);
      const serverMessage = error.response?.data?.message;

      if (
        error.response?.status === 400 &&
        typeof serverMessage === "string" &&
        serverMessage.toLowerCase().includes("already exists")
      ) {
        showToast(
          "Cannot duplicate employee entry: name already exists.",
          "error"
        );
      } else if (serverMessage) {
        showToast(serverMessage, "error");
      } else {
        showToast("Failed to save employee.", "error");
      }
    }
  };

  const handleDelete = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/employee/delete/employee/${deleteId}`
      );
      showToast("Employee moved to archive");
      getAllEmployees();
      closeDeleteModal();
    } catch (error) {
      console.error(error);
      showToast("Failed to archive employee", "error");
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          "ID",
          "Name",
          "Birthday",
          "Position",
          "Active",
          "Address",
          "Contact",
          "Email",
          "Role",
        ],
      ],
      body: employees.map((emp) => [
        emp.id,
        emp.name,
        emp.birthday
          ? new Date(emp.birthday).toLocaleDateString()
          : "—",
        emp.position,
        emp.isActive ? "Yes" : "No",
        emp.address,
        emp.contact,
        emp.email,
        emp.role,
      ]),
    });
    doc.save("employees.pdf");
  };

  const uniqueRoles = [...new Set(employees.map((emp) => emp.role))];
  const uniqueNames = [...new Set(employees.map((emp) => emp.name))];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = Object.values(emp)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole ? emp.role === selectedRole : true;
    const matchesName = selectedName ? emp.name === selectedName : true;
    return matchesSearch && matchesRole && matchesName;
  });

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div
      className="container-fluid p-2"
      style={{
        fontSize: "0.8rem",
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
      }}
    >
      <h2 className="mb-4">Employee Management</h2>

      <div className="d-flex justify-content-end mb-3 gap-2">
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
            color: "var(--text-color)",
            backgroundColor: "transparent",
          }}
        >
          <FontAwesomeIcon icon={faFilePdf} className="me-2" /> Export PDF
        </button>
      </div>

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-4 mb-2 position-relative">
          <input
            className="form-control ps-5"
            placeholder="Search employees..."
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
        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
              border: "1px solid var(--border-color)",
            }}
          >
            <option value="">All Roles</option>
            {uniqueRoles.map((role, i) => (
              <option key={i} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
              border: "1px solid var(--border-color)",
            }}
          >
            <option value="">All Names</option>
            {uniqueNames.map((name, i) => (
              <option key={i} value={name}>
                {name}
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
              <th>Image</th>
              <th>Name</th>
              <th>Birthday</th>
              <th>Position</th>
              <th>Active</th>
              <th>Address</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length ? (
              filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div
  style={{
    position: "relative",
    width: "40px",
    height: "40px",
    overflow: "hidden",
    borderRadius: "50%",
    backgroundColor: "var(--border-color)",
    display: "inline-block",
  }}
>
  {/* Default / placeholder image underneath */}
  <img
    src="/default.png"
    alt="default"
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      zIndex: 1,
    }}
  />

  {/* Employee image on top if available */}
  {employeeImages[emp.id] && (
    <img
      src={employeeImages[emp.id]}
      alt={emp.name || "employee"}
      onError={(e) => {
        // hide failed image so default remains visible
        e.currentTarget.style.display = "none";
      }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: 2,
      }}
    />
  )}
</div>

                  </td>
                  <td>{emp.name}</td>
                  <td>
                    {emp.birthday
                      ? new Date(emp.birthday).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>{emp.position}</td>
                  <td>
                    <span
                      style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: emp.isActive
                          ? "limegreen"
                          : "gray",
                        marginRight: "5px",
                      }}
                    ></span>
                    {emp.isActive ? "Active" : "Offline"}
                  </td>
                  <td>{emp.address}</td>
                  <td>{emp.contact}</td>
                  <td>{emp.email}</td>
                  <td>{emp.role}</td>
                  <td>{new Date(emp.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2 bg-yellow"
                      onClick={() => openModal(true, emp)}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => openDeleteModal(emp.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Button */}
      <button
        className="btn btn-success rounded-circle position-fixed"
        style={{
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
        }}
        onClick={() => openModal(false)}
      >
        +
      </button>

      {/* Employee Modal */}
      <div className="modal fade" id="employeeModal" tabIndex="-1">
        <div className="modal-dialog">
          <div
            className="modal-content p-4"
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
            }}
          >
            <h5>{isEditing ? "Edit Employee" : "Add Employee"}</h5>

            {[
              "Name",
              "Birthday",
              "Position",
              "Address",
              "Contact",
              "Email",
            ].map((label, idx) => (
              <div key={idx}>
                <label className="mt-2">{label}</label>
                <input
                  type={label === "Birthday" ? "date" : "text"}
                  className="form-control my-2"
                  placeholder={label}
                  value={formData[label.toLowerCase()]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [label.toLowerCase()]: e.target.value,
                    })
                  }
                  style={{
                    backgroundColor: "var(--bg-color)",
                    color: "var(--text-color)",
                    border: "1px solid var(--border-color)",
                  }}
                />
              </div>
            ))}

            <label className="mt-2">Role</label>
            <select
              className="form-select my-2"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
                border: "1px solid var(--border-color)",
              }}
            >
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-secondary me-2" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleSave}>
                {isEditing ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div className="modal fade" id="deleteModal" tabIndex="-1">
        <div className="modal-dialog">
          <div
            className="modal-content p-4"
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
            }}
          >
            <h5>Confirm Delete</h5>
            <p>Are you sure you want to delete this employee?</p>
            <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-secondary me-2"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
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
        } text-white ${toastMessage ? "show" : ""}`}
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
              toastRef.current?.classList.remove("show");
            }}
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTable;
