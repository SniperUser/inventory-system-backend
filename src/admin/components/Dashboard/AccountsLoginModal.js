// AccountsLoginModal.js
import React, { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilePdf,
  faSun,
  faMoon,
  faSignInAlt,
} from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as bootstrap from "bootstrap";
import { ThemeContext } from "../../context/themeContext.js";
import { useNavigate } from "react-router-dom";

const AccountsLoginModal = ({ show, onClose }) => {
  const [logins, setLogins] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const toastRef = useRef(null);
  const { theme, setTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.employee_id;
  const localLoginTime = localStorage.getItem("loginTime");

  useEffect(() => {
    if (show) {
      fetchLogins();
    }
  }, [show]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const fetchLogins = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/login/logged-in-users"
      );
      setLogins(res.data);
    } catch (err) {
      console.error("❌ Error fetching login records:", err);
      showToast("Failed to fetch login history.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    const toastEl = toastRef.current;
    if (toastEl) {
      toastEl.classList.remove("show");
      void toastEl.offsetWidth; // reset animation
      new bootstrap.Toast(toastEl).show();
    }
  };

  const filteredLogins = logins.filter((l) => {
    const matchesRole =
      roleFilter === "all" || (l.role || "").toLowerCase() === roleFilter;
    const term = search.toLowerCase();
    return (
      matchesRole &&
      ((l.username || "").toLowerCase().includes(term) ||
        (l.role || "").toLowerCase().includes(term))
    );
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Accounts Login History", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["#", "Username", "Role", "Login Time"]],
      body: filteredLogins.map((l, index) => [
        index + 1,
        l.username,
        l.role,
        l.login_time ? new Date(l.login_time).toLocaleString("en-PH") : "-",
      ]),
      styles: { fontSize: 9, halign: "left" },
      headStyles: {
        fillColor: theme === "dark" ? [52, 58, 64] : [220, 220, 220],
      },
    });
    doc.save("accounts-login-history.pdf");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content shadow-lg rounded-4 border-0">
          {/* Header */}
          <div
            className="modal-header text-white"
            style={{
              background: "linear-gradient(90deg, #343a40, #6c757d)",
            }}
          >
            <h5 className="modal-title d-flex align-items-center gap-2 fw-bold">
              <FontAwesomeIcon icon={faSignInAlt} /> Accounts Login History
            </h5>
            <div className="d-flex align-items-center ms-auto gap-2">
              <button
                className="btn btn-sm btn-outline-light"
                onClick={toggleTheme}
              >
                <FontAwesomeIcon icon={theme === "dark" ? faSun : faMoon} />
              </button>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={handleExportPDF}
              >
                <FontAwesomeIcon icon={faFilePdf} className="me-1" /> PDF
              </button>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>
          </div>

          {/* Body */}
          <div
            className="modal-body"
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
            }}
          >
            {/* Filters/Search */}
            <div className="row g-2 mb-3">
              <div className="col-md-6 position-relative">
                <input
                  className="form-control ps-5"
                  placeholder="Search by username or role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{
                    backgroundColor: "var(--bg-color)",
                    color: "var(--text-color)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <p className="text-center text-muted">Loading...</p>
            ) : filteredLogins.length > 0 ? (
              <div className="table-responsive shadow-sm rounded small">
                <table
                  className="table table-striped table-hover align-middle mb-0"
                  style={{
                    backgroundColor: "var(--bg-color)",
                    color: "var(--text-color)",
                  }}
                >
                  <thead
                    style={{
                      backgroundColor:
                        theme === "dark" ? "var(--dark-header)" : "#f8f9fa",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  >
                    <tr className="text-center">
                      <th>#</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Login Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogins.map((login, index) => (
                      <tr key={login.id}>
                        <td className="fw-bold text-center">{index + 1}</td>
                        <td>{login.username}</td>
                        <td>
                          <span
                            className={`badge ${
                              login.role === "admin"
                                ? "bg-info"
                                : "bg-secondary"
                            }`}
                          >
                            {login.role}
                          </span>
                        </td>
                        <td className="text-center">
                          {String(login.id) === String(currentUserId) &&
                          localLoginTime
                            ? new Date(localLoginTime).toLocaleTimeString(
                                "en-PH",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                  hour12: true,
                                }
                              ) +
                              " " +
                              new Date(localLoginTime).toLocaleDateString(
                                "en-PH",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : login.login_time
                            ? new Date(login.login_time).toLocaleTimeString(
                                "en-PH",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                  hour12: true,
                                }
                              ) +
                              " " +
                              new Date(login.login_time).toLocaleDateString(
                                "en-PH",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted">No login records found.</p>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-outline-primary px-4"
              onClick={() => {
                onClose();
                navigate("/login");
              }}
            >
              Go to Login page here..
            </button>
            <button className="btn btn-secondary px-4" onClick={onClose}>
              Close
            </button>
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
          <div className="toast-body text-center w-100">{toastMessage}</div>

          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            onClick={() => {
              if (toastRef.current) {
                toastRef.current.classList.remove("show");
              }
            }}
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  );
};

export default AccountsLoginModal;
