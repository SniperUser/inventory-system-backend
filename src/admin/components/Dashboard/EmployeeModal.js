// EmployeesModal.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const EmployeesModal = ({ show, onClose }) => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      setLoading(true);
      axios
        .get("http://localhost:5000/api/dashboard/employees")
        .then((res) => {
          setEmployees(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("❌ Error fetching employees:", err);
          setLoading(false);
        });
    }
  }, [show]);

  if (!show) return null;

  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toISOString().split("T")[0];
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content shadow-lg rounded-4 border-0">
          {/* Header */}
          <div
            className="modal-header text-white"
            style={{
              background: "linear-gradient(90deg, #0d6efd, #4dabf7)",
            }}
          >
            <h5 className="modal-title d-flex align-items-center gap-2 fw-bold">
              <FaUsers /> Employees List ({employees.length})
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body bg-light">
            {/* Search Bar */}
            <div className="input-group mb-4 shadow-sm rounded">
              <span className="input-group-text bg-white border-0">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Search employee name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Employees Table */}
            {loading ? (
              <p className="text-center text-muted fst-italic">
                Loading employees...
              </p>
            ) : filteredEmployees.length > 0 ? (
              <div className="table-responsive shadow-sm rounded">
                <table className="table table-striped table-hover align-middle mb-0">
                  <thead className="table-primary text-center">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Role</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Address</th>
                      <th>Birthday</th>
                      <th>Created At</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp, index) => (
                      <tr key={emp.id}>
                        <td className="text-center fw-bold">{index + 1}</td>
                        <td>{emp.name}</td>
                        <td>{emp.position}</td>
                        <td>{emp.role}</td>
                        <td style={{ fontSize: "0.9rem" }}>{emp.email}</td>
                        <td>{emp.contact}</td>
                        <td style={{ fontSize: "0.9rem" }}>{emp.address}</td>
                        <td>{formatDate(emp.birthday)}</td>
                        <td>{formatDate(emp.created_at)}</td>
                        <td className="text-center">
                          {emp.isActive ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-secondary">Inactive</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted fst-italic text-center">
                No employees found.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-0">
            <button
              className="btn btn-outline-primary"
              onClick={() => {
                onClose();
                navigate("/employee"); // optional: navigate to employees page
              }}
            >
              👥 Go to Employees Page
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeesModal;
