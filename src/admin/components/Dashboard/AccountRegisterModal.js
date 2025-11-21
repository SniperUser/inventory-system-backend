// AccountsRegisterModal.js
import React, { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilePdf,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../../context/themeContext.js";
import { useNavigate } from "react-router-dom";

const AccountsRegisterModal = ({ show, onClose }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { theme, setTheme } = useContext(ThemeContext);
  const toastRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      fetchRegisteredUsers();
    }
  }, [show]);

  const fetchRegisteredUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/login/all-registered-users"
      );
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Error fetching registered users:", err);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(term) ||
      (u.username || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      (u.role || "").toLowerCase().includes(term) ||
      (u.position || "").toLowerCase().includes(term)
    );
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          "ID",
          "Username",
          "Name",
          "Email",
          "Role",
          "Position",
          "Active",
          "Registered At",
        ],
      ],
      body: filteredUsers.map((u) => [
        u.register_id,
        u.username,
        u.name,
        u.email,
        u.role,
        u.position,
        u.isActive ? "Yes" : "No",
        u.registered_at || "-",
      ]),
      styles: { halign: "left" },
    });
    doc.save("registered_users.pdf");
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-xl" role="document">
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title">📋 Registered Accounts</h5>
            <div className="d-flex align-items-center ms-auto gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <FontAwesomeIcon icon={faSun} />
                ) : (
                  <FontAwesomeIcon icon={faMoon} />
                )}
              </button>
              <button className="btn btn-outline-primary" onClick={exportPDF}>
                <FontAwesomeIcon icon={faFilePdf} className="me-1" /> Export PDF
              </button>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
          </div>

          <div className="modal-body">
            {/* ✅ Search */}
            <div className="mb-3 position-relative">
              <input
                className="form-control ps-5"
                placeholder="Search registered employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="position-absolute top-50 start-0 translate-middle-y ms-3"
              />
            </div>

            {/* ✅ Table */}
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Position</th>
                    <th>Active</th>
                    <th>Registered At</th>
                    <th>Image</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length ? (
                    filteredUsers.map((u) => (
                      <tr key={u.register_id}>
                        <td>{u.register_id}</td>
                        <td>{u.username}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>{u.position}</td>
                        <td>{u.isActive ? "Yes" : "No"}</td>
                        <td>{u.registered_at || "-"}</td>
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
                            />
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center">
                        No registered employees found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={() => {
                onClose();
                navigate("/register");
              }}
            >
              Go to Register Account here..
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsRegisterModal;
