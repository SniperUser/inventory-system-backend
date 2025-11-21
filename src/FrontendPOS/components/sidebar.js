// Sidebar.js
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Sidebar = () => {
  const location = useLocation();

  const categories = [
    { path: "/pos/detail/", label: "All", icon: "fa-list" },
    { path: "/pos/detail/can-goods", label: "Can Goods", icon: "fa-utensils" },
    { path: "/pos/detail/snacks", label: "Snacks", icon: "fa-cookie-bite" },
    { path: "/pos/detail/drinks", label: "Drinks", icon: "fa-coffee" },
    {
      path: "/pos/detail/instant-noodles",
      label: "Instant Noodles",
      icon: "fa-bowl-food",
    },
    {
      path: "/pos/detail/condiments",
      label: "Condiments",
      icon: "fa-pepper-hot",
    },
    { path: "/pos/detail/rice", label: "Rice", icon: "fa-seedling" },
    {
      path: "/pos/detail/frozen-goods",
      label: "Frozen Goods",
      icon: "fa-snowflake",
    },
    {
      path: "/pos/detail/personal-care",
      label: "Personal Care",
      icon: "fa-spa",
    },
    { path: "/pos/detail/laundry", label: "Laundry", icon: "fa-soap" },
    {
      path: "/pos/detail/household",
      label: "Household Items",
      icon: "fa-home",
    },
    { path: "/pos/detail/others", label: "Others", icon: "fa-ellipsis-h" },
  ];

  return (
    <div
      className="bg-white sidebar-fixed"
      style={{
        width: "280px",
        minHeight: "100vh",
        borderRight: "1px solid #ddd",
        paddingTop: "15px",
        flexShrink: 0, // Prevent shrinking
      }}
    >
      <div className="p-3">
        <h5 className="text-uppercase text-muted mb-3">Category</h5>
        <ul className="list-unstyled d-grid gap-2">
          {categories.map((cat, index) => {
            const isActive = location.pathname === cat.path;
            return (
              <li key={index}>
                <Link
                  to={cat.path}
                  className={`category-btn w-100 text-start ${
                    isActive ? "active" : ""
                  }`}
                >
                  <i className={`fas ${cat.icon} me-2`}></i>
                  {cat.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <style>{`
        .category-btn {
          display: flex;
          align-items: center;
          border: 1px solid #ccc;
          border-radius: 12px;
          color: black;
          background-color: white;
          padding: 10px 12px;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.2s ease-in-out;
        }
        .category-btn:hover {
          background-color: #1ad68e;
          border-color: #1ad68e;
          color: white;
          transform: scale(1.02);
        }
        .category-btn.active {
          background-color: #1ad68e;
          border-color: #1ad68e;
          color: white;
        }
        .sidebar-fixed {
          position: sticky;
          top: 0;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
