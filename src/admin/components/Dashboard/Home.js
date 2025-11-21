// Dashboard.js
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faBoxes,
  faTruck,
  faShoppingCart,
  faUndo,
  faCheckCircle,
  faUserLock,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import SalesModal from "./SalesModal.js";
import ProductsModal from "./ProductsModal.js";
import LowStockAlert from "./LowStockAlert.js";
import OrdersModal from "./OrdersModal.js";
import EmployeesModal from "./EmployeeModal.js";
import ReturnSalesModal from "./ReturnSalesModal.js";
import DeliveriesModal from "./DeliveriesModal.js";
import AccountsLoginModal from "./AccountsLoginModal.js";
import AccountsRegisterModal from "./AccountRegisterModal.js";
import axios from "axios";

const Dashboard = () => {
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showEmployeesModal, setShowEmployeesModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showReturnSalesModal, setShowReturnSalesModal] = useState(false);
  const [showDeliveriesModal, setShowDeliveriesModal] = useState(false);
  const [showAccountsLoginModal, setShowAccountsLoginModal] = useState(false);
  const [showAccountsRegisterModal, setShowAccountsRegisterModal] =
    useState(false);

  const [salesTotal, setSalesTotal] = useState(0);
  const [productsTotal, setProductsTotal] = useState(0);
  const [employeesTotal, setEmployeesTotal] = useState(0);
  const [returnSalesTotal, setReturnSalesTotal] = useState(0);
  const [deliveriesTotal, setDeliveriesTotal] = useState(0);
  const [accountsLoginTotal, setAccountsLoginTotal] = useState(0);
  const [accountsRegisterTotal, setAccountsRegisterTotal] = useState(0);

  const [hoveredCard, setHoveredCard] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  // ✅ Fetch sales
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboard/sales-report")
      .then((res) => {
        const total = res.data.reduce((acc, item) => acc + item.quantity, 0);
        setSalesTotal(total);
      })
      .catch((err) => console.error("❌ Error fetching sales:", err));
  }, []);

  // ✅ Fetch products
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboard/products-report")
      .then((res) => setProductsTotal(res.data.length))
      .catch((err) => console.error("❌ Error fetching products:", err));
  }, []);

  // ✅ Fetch employees
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboard/employees")
      .then((res) => setEmployeesTotal(res.data.length))
      .catch((err) => console.error("❌ Error fetching employees:", err));
  }, []);

  // ✅ Fetch return sales
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboard/return-sales-report")
      .then((res) => setReturnSalesTotal(res.data.length))
      .catch((err) => console.error("❌ Error fetching return sales:", err));
  }, []);

  // ✅ Fetch deliveries
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboard/deliveries-report")
      .then((res) => setDeliveriesTotal(res.data.length))
      .catch((err) => console.error("❌ Error fetching deliveries:", err));
  }, []);

  // ✅ Fetch accounts login
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/login/logged-in-users")
      .then((res) => setAccountsLoginTotal(res.data.length))
      .catch((err) => console.error("❌ Error fetching accounts login:", err));
  }, []);

  // ✅ Fetch accounts register
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/login/all-registered-users")
      .then((res) => setAccountsRegisterTotal(res.data.length))
      .catch((err) =>
        console.error("❌ Error fetching accounts register:", err)
      );
  }, []);

  const summary = {
    employees: employeesTotal,
    products: productsTotal,
    suppliers: 15, // static
    sales: salesTotal,
    returnSales: returnSalesTotal,
    orders: 25, // static
    deliveries: deliveriesTotal,
    accountsLogin: accountsLoginTotal,
    accountsRegister: accountsRegisterTotal,
  };

  // ✅ Utility for hover styles
  const getHoverStyle = (cardKey, baseClass) => ({
    transition: "all 0.3s ease-in-out",
    transform: hoveredCard === cardKey ? "scale(1.03)" : "scale(1)",
    cursor: "pointer",
    ...(baseClass.includes("bg-") && {
      filter: hoveredCard === cardKey ? "brightness(90%)" : "none",
    }),
    ...(baseClass.includes("border-") && {
      backgroundColor: hoveredCard === cardKey ? "#f8f9fa" : "transparent",
    }),
  });

  return (
    <div className="container-fluid mt-4">
      <h2
        className="mb-4"
        style={{
          background: "lightgray",
          width: "50%",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        📊 Dashboard Overview
      </h2>

      {/* Row 1 */}
      <div className="row g-4">
        {/* Employees */}
        <div className="col-md-3">
          <div
            className="card text-primary border-primary shadow-sm"
            style={getHoverStyle("employees", "border-primary")}
            onMouseEnter={() => setHoveredCard("employees")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setShowEmployeesModal(true)}
          >
            <div
              className="card-body d-flex align-items-center"
              style={{ textShadow: "1px 1px 2px white" }}
            >
              <FontAwesomeIcon icon={faUsers} size="2x" className="me-3" />
              <div>
                <h5 className="card-title">Employees</h5>
                <h3>{summary.employees}</h3>
              </div>
            </div>
          </div>
        </div>
        <EmployeesModal
          show={showEmployeesModal}
          onClose={() => setShowEmployeesModal(false)}
        />

        {/* Products */}
        <div className="col-md-3">
          <div
            className="card text-success border-success shadow-sm"
            style={getHoverStyle("products", "border-success")}
            onMouseEnter={() => setHoveredCard("products")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setShowProductsModal(true)}
          >
            <div
              className="card-body d-flex flex-column align-items-start"
              style={{ textShadow: "1px 1px 2px white" }}
            >
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faBoxes} size="2x" className="me-3" />
                <div>
                  <h5 className="card-title">Products</h5>
                  <h3>{summary.products}</h3>
                </div>
              </div>
              <div className="mt-2">
                <LowStockAlert compact />
              </div>
            </div>
          </div>
        </div>
        <ProductsModal
          show={showProductsModal}
          onClose={() => setShowProductsModal(false)}
        />

        {/* Sales */}
        <div className="col-md-3">
          <div
            className="card text-danger border-danger shadow-sm"
            style={getHoverStyle("sales", "border-danger")}
            onMouseEnter={() => setHoveredCard("sales")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setShowSalesModal(true)}
          >
            <div
              className="card-body d-flex align-items-center"
              style={{ textShadow: "1px 1px 2px white" }}
            >
              <FontAwesomeIcon
                icon={faShoppingCart}
                size="2x"
                className="me-3"
              />
              <div>
                <h5 className="card-title">Sales</h5>
                <h3>{summary.sales}</h3>
              </div>
            </div>
          </div>
        </div>
        <SalesModal
          show={showSalesModal}
          onClose={() => setShowSalesModal(false)}
        />

        {/* Accounts Login */}
        <div className="col-md-3">
          <div
            className="card border-warning shadow-sm"
            style={getHoverStyle("accountsLogin", "border-warning")}
            onMouseEnter={() => setHoveredCard("accountsLogin")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setShowAccountsLoginModal(true)}
          >
            <div
              className="card-body text-warning d-flex align-items-center"
              style={{ textShadow: "1px 1px 2px black" }}
            >
              <FontAwesomeIcon icon={faUserLock} size="2x" className="me-3" />
              <div>
                <h6>Accounts Login</h6>
                <h4>{summary.accountsLogin}</h4>
              </div>
            </div>
          </div>
        </div>
        <AccountsLoginModal
          show={showAccountsLoginModal}
          onClose={() => setShowAccountsLoginModal(false)}
        />
      </div>

      {/* Row 2 */}
      <div className="row g-4 mt-3">
        {/* Return Sales */}
        <div className="col-md-3">
          <div
            className="card border-primary shadow-sm"
            style={getHoverStyle("returnSales", "border-primary")}
            onMouseEnter={() => setHoveredCard("returnSales")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setShowReturnSalesModal(true)}
          >
            <div
              className="card-body text-primary d-flex align-items-center"
              style={{ textShadow: "1px 1px 2px white" }}
            >
              <FontAwesomeIcon icon={faUndo} size="2x" className="me-3" />
              <div>
                <h6>Return Sales</h6>
                <h4>{summary.returnSales}</h4>
              </div>
            </div>
          </div>
        </div>
        <ReturnSalesModal
          show={showReturnSalesModal}
          onClose={() => setShowReturnSalesModal(false)}
        />

        {/* Orders */}
        <div className="col-md-3">
          <div
            className="card border-info shadow-sm"
            style={getHoverStyle("orders", "border-info")}
            onMouseEnter={() => setHoveredCard("orders")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setShowOrdersModal(true)}
          >
            <div
              className="card-body text-info d-flex align-items-center"
              style={{ textShadow: "1px 1px 2px white" }}
            >
              <FontAwesomeIcon
                icon={faCheckCircle}
                size="2x"
                className="me-3"
              />
              <div>
                <h6>Orders</h6>
                <h4>{summary.orders}</h4>
              </div>
            </div>
          </div>
        </div>
        <OrdersModal
          show={showOrdersModal}
          onClose={() => setShowOrdersModal(false)}
        />

        {/* Deliveries */}
        <div className="col-md-3">
          <div
            className="card border-success shadow-sm"
            style={getHoverStyle("deliveries", "border-success")}
            onMouseEnter={() => setHoveredCard("deliveries")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setShowDeliveriesModal(true)}
          >
            <div
              className="card-body text-success d-flex align-items-center"
              style={{ textShadow: "1px 1px 2px white" }}
            >
              <FontAwesomeIcon icon={faTruck} size="2x" className="me-3" />
              <div>
                <h6>Deliveries</h6>
                <h4>{summary.deliveries}</h4>
              </div>
            </div>
          </div>
        </div>
        <DeliveriesModal
          show={showDeliveriesModal}
          onClose={() => setShowDeliveriesModal(false)}
        />

        {/* Accounts Register */}
        <div className="col-md-3">
          <div
            className="card border-secondary shadow-sm"
            style={getHoverStyle("accountsRegister", "border-secondary")}
            onMouseEnter={() => setHoveredCard("accountsRegister")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setShowAccountsRegisterModal(true)}
          >
            <div
              className="card-body text-secondary d-flex align-items-center"
              style={{ textShadow: "1px 1px 2px white" }}
            >
              <FontAwesomeIcon icon={faUserPlus} size="2x" className="me-3" />
              <div>
                <h6>Accounts Register</h6>
                <h4>{summary.accountsRegister}</h4>
              </div>
            </div>
          </div>
        </div>
        <AccountsRegisterModal
          show={showAccountsRegisterModal}
          onClose={() => setShowAccountsRegisterModal(false)}
        />
      </div>

      {/* Collapsible Description Section */}
      <div className="row mt-5">
        <div className="col-12">
          {!showInfo && (
            <button
              className="btn btn-outline-secondary mb-3"
              onClick={() => setShowInfo(true)}
            >
              ℹ️ Learn More About This Dashboard
            </button>
          )}

          {showInfo && (
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="card-title mb-3">About This Dashboard</h4>
                  {/* ✅ Close button at top right */}
                  <button
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowInfo(false)}
                  ></button>
                </div>

                <p
                  className="card-text"
                  style={{ textAlign: "justify", lineHeight: "1.7" }}
                >
                  This dashboard serves as the central control panel for
                  monitoring and managing the core operations of the system. It
                  provides a quick overview of essential business data such as
                  employee count, product inventory, sales performance, return
                  transactions, pending orders, deliveries, and user accounts.
                  Each section is represented by an interactive card that not
                  only summarizes the data but also allows you to drill deeper
                  into specific details through modals that open on click.
                </p>
                <p
                  className="card-text"
                  style={{ textAlign: "justify", lineHeight: "1.7" }}
                >
                  The <strong>Sales</strong> and <strong>Return Sales</strong>{" "}
                  sections make it easy to keep track of daily transactions and
                  identify trends in customer activity. The{" "}
                  <strong>Orders</strong> and <strong>Deliveries</strong> cards
                  focus on logistics, ensuring that supply chain processes are
                  transparent and well-coordinated. Finally, the{" "}
                  <strong>Accounts Login</strong> and{" "}
                  <strong>Accounts Register</strong> cards provide insights into
                  system usage, helping administrators monitor active sessions
                  and manage new user registrations.
                </p>
                <p
                  className="card-text"
                  style={{ textAlign: "justify", lineHeight: "1.7" }}
                >
                  In short, this dashboard is designed not just as a reporting
                  tool, but as a real-time operational hub. Its purpose is to
                  reduce the time spent navigating through multiple menus or
                  reports and to present critical information in a concise yet
                  actionable format. With interactive features and easy-to-read
                  data visualization, it ensures that key insights are always
                  just one click away.
                </p>

                {/* ✅ Extra Close button at bottom */}
                <div className="text-end mt-3">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setShowInfo(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
