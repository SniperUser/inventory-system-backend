import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  faTachometerAlt,
  faBoxes,
  faUserLock,
  faShoppingCart,
  faTruck,
  faBox,
  faUser,
  faSignInAlt,
  faUserPlus,
  faKey,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../context/themeContext.js";

function Sidebar() {
  const { theme } = useContext(ThemeContext);
  const [open, setOpen] = useState({
    products: false,
    auth: false,
    sales: false,
    delivery: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const toggleSection = (key) => {
    setOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const employeeId = storedUser?.employee_id;

    try {
      if (employeeId) {
        await axios.post("http://localhost:5000/api/login/logout/user", {
          employee_id: employeeId,
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    }

    localStorage.clear();
    sessionStorage.removeItem("appInitialized");
    navigate("/loginPage", { replace: true });
  };

  const isActive = (path) => location.pathname.startsWith(path);

  // ✅ Auto-expand sections if child path is active
  useEffect(() => {
    if (isActive("/stock") || isActive("/supplier")) {
      setOpen((prev) => ({ ...prev, products: true }));
    }
    if (isActive("/sales/main") || isActive("/sales/return")) {
      setOpen((prev) => ({ ...prev, sales: true }));
    }
    if (isActive("/sales/delivery") || isActive("/sales/done-delivery")) {
      setOpen((prev) => ({ ...prev, delivery: true }));
    }
    if (
      isActive("/login") ||
      isActive("/register") ||
      isActive("/forgot-password")
    ) {
      setOpen((prev) => ({ ...prev, auth: true }));
    }
  }, [location]);

  // ✅ Apple Green style
  const activeStyle = { backgroundColor: "#8DB600", color: "#fff" };

  // ✅ Uniform text style
  const textStyle = {
    fontSize: "14px",
    fontWeight: "500",
  };

  return (
    <div
      className="vh-100 d-flex flex-column"
      style={{
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
        width: "250px",
        borderRight: "1px solid var(--border-color)",
      }}
    >
      {/* Scrollable navigation */}
      <nav className="flex-grow-1 overflow-auto p-3 mt-4">
        <div
          className="text-uppercase small mb-2"
          style={{ fontSize: "14px", fontWeight: "600" }}
        >
          Core
        </div>
        <Link
          className={`nav-link mb-2 rounded`}
          to="/home"
          style={
            isActive("/home")
              ? { ...activeStyle, ...textStyle }
              : { ...textStyle, color: "var(--text-color)" }
          }
        >
          <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
          Dashboard
        </Link>

        <div
          className="text-uppercase small mt-3 mb-2"
          style={{ fontSize: "14px", fontWeight: "600" }}
        >
          Interface
        </div>

        {/* Employee */}
        <Link
          className={`nav-link ps-3 mb-2 rounded`}
          to="/employee"
          style={
            isActive("/employee")
              ? { ...activeStyle, ...textStyle }
              : { ...textStyle, color: "var(--text-color)" }
          }
        >
          <FontAwesomeIcon icon={faUser} className="me-2" />
          Employee
        </Link>

        {/* Products */}
        <button
          className={`btn w-100 text-start d-flex justify-content-between align-items-center mb-2 ps-3 rounded`}
          onClick={() => toggleSection("products")}
          style={
            isActive("/stock") || isActive("/supplier")
              ? { ...activeStyle, ...textStyle }
              : { ...textStyle, color: "var(--text-color)" }
          }
        >
          <span>
            <FontAwesomeIcon icon={faBoxes} className="me-2" />
            Products
          </span>
          <FontAwesomeIcon
            icon={faAngleRight}
            style={{
              transition: "transform 0.3s ease",
              transform: open.products ? "rotate(90deg)" : "rotate(0deg)",
            }}
          />
        </button>

        <div className={`collapse ${open.products ? "show" : ""} ps-4`}>
          <Link
            className="nav-link ps-3 mb-2 rounded"
            to="/stock"
            style={
              isActive("/stock")
                ? { ...activeStyle, ...textStyle }
                : { ...textStyle, color: "var(--text-color)" }
            }
          >
            <FontAwesomeIcon icon={faBox} className="me-2" />
            Stock
          </Link>
          <Link
            className="nav-link ps-3 mb-2 rounded"
            to="/supplier"
            style={
              isActive("/supplier")
                ? { ...activeStyle, ...textStyle }
                : { ...textStyle, color: "var(--text-color)" }
            }
          >
            <FontAwesomeIcon icon={faTruck} className="me-2" />
            Supplier
          </Link>
        </div>

        {/* Sales */}
        <button
          className={`btn w-100 text-start d-flex justify-content-between align-items-center mb-2 rounded`}
          onClick={() => toggleSection("sales")}
          style={
            isActive("/sales/main") || isActive("/sales/return")
              ? { ...activeStyle, ...textStyle }
              : { ...textStyle, color: "var(--text-color)" }
          }
        >
          <span>
            <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
            Sales
          </span>
          <FontAwesomeIcon
            icon={faAngleRight}
            style={{
              transition: "transform 0.3s ease",
              transform: open.sales ? "rotate(90deg)" : "rotate(0deg)",
            }}
          />
        </button>

        <div className={`collapse ${open.sales ? "show" : ""} ps-3`}>
          <Link
            className="nav-link ps-3 mb-2 rounded"
            to="/sales/main"
            style={
              isActive("/sales/main")
                ? { ...activeStyle, ...textStyle }
                : { ...textStyle, color: "var(--text-color)" }
            }
          >
            <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
            Sales
          </Link>
          <Link
            className="nav-link ps-3 mb-2 rounded"
            to="/sales/return"
            style={
              isActive("/sales/return")
                ? { ...activeStyle, ...textStyle }
                : { ...textStyle, color: "var(--text-color)" }
            }
          >
            <FontAwesomeIcon icon={faBox} className="me-2" />
            Return
          </Link>
        </div>

        {/* Delivery */}
        <button
          className={`btn w-100 text-start d-flex justify-content-between align-items-center mb-2 rounded`}
          onClick={() => toggleSection("delivery")}
          style={
            isActive("/sales/delivery") || isActive("/sales/done-delivery")
              ? { ...activeStyle, ...textStyle }
              : { ...textStyle, color: "var(--text-color)" }
          }
        >
          <span>
            <FontAwesomeIcon icon={faTruck} className="me-2" />
            Delivery
          </span>
          <FontAwesomeIcon
            icon={faAngleRight}
            style={{
              transition: "transform 0.3s ease",
              transform: open.delivery ? "rotate(90deg)" : "rotate(0deg)",
            }}
          />
        </button>

        <div className={`collapse ${open.delivery ? "show" : ""} ps-3`}>
          <Link
            className="nav-link ps-3 mb-2 rounded"
            to="/sales/delivery"
            style={
              isActive("/sales/delivery")
                ? { ...activeStyle, ...textStyle }
                : { ...textStyle, color: "var(--text-color)" }
            }
          >
            <FontAwesomeIcon icon={faTruck} className="me-2" />
            Order
          </Link>
          <Link
            className="nav-link ps-3 mb-2 rounded"
            to="/sales/done-delivery"
            style={
              isActive("/sales/done-delivery")
                ? { ...activeStyle, ...textStyle }
                : { ...textStyle, color: "var(--text-color)" }
            }
          >
            <FontAwesomeIcon icon={faBox} className="me-2" />
            Done Deliver
          </Link>
        </div>

        {/* Account */}
        <button
          className={`btn w-100 text-start d-flex justify-content-between align-items-center mb-2 rounded`}
          onClick={() => toggleSection("auth")}
          style={
            isActive("/login") ||
            isActive("/register") ||
            isActive("/forgot-password")
              ? { ...activeStyle, ...textStyle }
              : { ...textStyle, color: "var(--text-color)" }
          }
        >
          <span>
            <FontAwesomeIcon icon={faUserLock} className="me-2" />
            Account
          </span>
          <FontAwesomeIcon
            icon={faAngleRight}
            style={{
              transition: "transform 0.3s ease",
              transform: open.auth ? "rotate(90deg)" : "rotate(0deg)",
            }}
          />
        </button>

        <div className={`collapse ${open.auth ? "show" : ""} ps-4`}>
          <Link
            className="nav-link ps-3 mb-2 rounded"
            to="/login"
            style={
              isActive("/login")
                ? { ...activeStyle, ...textStyle }
                : { ...textStyle, color: "var(--text-color)" }
            }
          >
            <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
            Login
          </Link>
          <Link
            className="nav-link ps-3 mb-2 rounded"
            to="/register"
            style={
              isActive("/register")
                ? { ...activeStyle, ...textStyle }
                : { ...textStyle, color: "var(--text-color)" }
            }
          >
            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
            Register
          </Link>
        </div>

        {/* Addons */}
        <div
          className="text-uppercase small mt-3 mb-2"
          style={{ fontSize: "14px", fontWeight: "600" }}
        >
          Addons
        </div>
        <Link
          className={`nav-link mb-2 rounded`}
          to="/archived"
          style={
            isActive("/archived")
              ? { ...activeStyle, ...textStyle }
              : { ...textStyle, color: "var(--text-color)" }
          }
        >
          <FontAwesomeIcon icon={faBox} className="me-2" />
          Archived
        </Link>
      </nav>

      {/* Logout Button */}
      <div
        className="p-3 border-top"
        style={{ borderTopColor: "var(--border-color)" }}
      >
        <button
          className="btn btn-danger w-100"
          onClick={handleLogout}
          style={textStyle}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
