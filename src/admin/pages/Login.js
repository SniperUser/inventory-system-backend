import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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

const LoggedInUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const toastRef = useRef(null);
  const { theme, setTheme } = useContext(ThemeContext);
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.employee_id;
  const localLoginTime = localStorage.getItem("loginTime");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchLoggedInUsers();

    const interval = setInterval(fetchLoggedInUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLoggedInUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/login/logged-in-users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch logged-in users:", err);
      showToast("Failed to fetch logged-in users.", "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    const toastEl = toastRef.current;
    if (toastEl) {
      toastEl.classList.remove("show");
      // force reflow to restart animation
      void toastEl.offsetWidth;
      new bootstrap.Toast(toastEl).show();
    }
  };

  // Filter users by role and search term
  const filteredUsers = users.filter((u) => {
    const matchesRole =
      roleFilter === "all" || (u.role || "").toLowerCase() === roleFilter;
    const term = searchTerm.toLowerCase();
    return (
      matchesRole &&
      ((u.full_name || "").toLowerCase().includes(term) ||
        (u.username || "").toLowerCase().includes(term) ||
        (u.email || "").toLowerCase().includes(term) ||
        (u.role || "").toLowerCase().includes(term) ||
        (u.status || "").toLowerCase().includes(term))
    );
  });

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Currently Online Employees", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [
        [
          "ID",
          "Full Name",
          "Username",
          "Email",
          "Role",
          "Status",
          "Login Time",
        ],
      ],
      body: filteredUsers.map((u) => [
        u.id,
        u.full_name,
        u.username,
        u.email,
        u.role,
        u.status,
        u.login_time ? new Date(u.login_time).toLocaleString() : "-",
      ]),
      styles: { fontSize: 9, halign: "left" },
      headStyles: {
        fillColor: theme === "dark" ? [52, 58, 64] : [220, 220, 220],
      },
    });
    doc.save("logged-in-users.pdf");
  };

  return (
    <div
      className="container-fluid p-3"
      style={{
        fontSize: "0.9rem",
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
        minHeight: "100vh",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="mb-0">Currently Online Employees</h3>

        <div className="d-flex gap-2 flex-wrap">
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
            className="btn btn-outline-primary"
            onClick={handleExportPDF}
            style={{
              borderColor: "var(--border-color)",
              backgroundColor: "transparent",
              color: "var(--text-color)",
            }}
          >
            <FontAwesomeIcon icon={faFilePdf} className="me-1" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters/Search */}
      <div className="row g-2 mb-3">
        <div className="col-md-6 position-relative">
          <input
            className="form-control ps-5"
            placeholder="Search users..."
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
              <th>Full Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Login Time</th>
              <th>Image</th>
              <th>Action</th> {/* ✅ New column */}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length ? (
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.full_name}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className={`badge ${
                        u.role === "admin" ? "bg-info" : "bg-secondary"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        u.status === "active" ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td>
                    {String(u.id) === String(currentUserId) && localLoginTime
                      ? new Date(localLoginTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }) +
                        " " +
                        new Date(localLoginTime).toLocaleDateString([], {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : u.login_time
                      ? new Date(u.login_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }) +
                        " " +
                        new Date(u.login_time).toLocaleDateString([], {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </td>

                  <td>
                    {u.image ? (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={`http://localhost:5000/${u.image}`}
                          alt="avatar"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "#444",
                        }}
                      ></div>
                    )}
                  </td>
                  {/* ✅ Action column */}
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={async () => {
                        try {
                          await axios.post(
                            "http://localhost:5000/api/login/logout/user",
                            { employee_id: u.id },
                            {
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          );

                          // If this is the current logged-in user, clear token and redirect
                          if (String(u.id) === String(currentUserId)) {
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            showToast("You have been logged out.", "success");
                            setTimeout(() => {
                              window.location.href = "/"; // redirect to login page
                            }, 1500);
                          } else {
                            showToast(
                              `${u.full_name} has been logged out.`,
                              "success"
                            );
                            fetchLoggedInUsers(); // refresh table
                          }
                        } catch (err) {
                          console.error("Logout error:", err);
                          showToast("Failed to logout user.", "error");
                        }
                      }}
                    >
                      Logout
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center">
                  No active users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

export default LoggedInUsersPage;
