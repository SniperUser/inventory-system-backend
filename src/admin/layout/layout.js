import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.js";
import Header from "../components/Header.js";
import useAutoLogout from "../hook/useautoLogout.js";
import { motion, AnimatePresence } from "framer-motion";

const AppLayout = () => {
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("tokenExpiry");

  useAutoLogout(300);

  useEffect(() => {
    const isTokenValid = token && (!expiry || Date.now() < parseInt(expiry));
    if (!isTokenValid) {
      localStorage.clear();
      sessionStorage.removeItem("appInitialized");
      navigate("/loginPage", { replace: true });
    }
  }, [navigate, token, expiry]);

  if (!token) return null;

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: "var(--bg-color)" }}
    >
      {/* 🔹 Animated Header */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <Header onToggleSidebar={toggleSidebar} user={user} />
      </motion.div>

      <div className="d-flex flex-grow-1" style={{ overflow: "hidden" }}>
        {/* 🔹 Sidebar (fixed height, not scrolling) */}
        <AnimatePresence>
          {isSidebarVisible && (
            <motion.div
              key="sidebar"
              initial={{ x: -250, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -250, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-dark text-white p-0"
              style={{
                width: "250px",
                minWidth: "250px",
                borderRight: "1px solid #ccc",
                height: "calc(100vh - 50px)", // Adjust based on header height
                position: "sticky",
                top: 0,
                overflowY: "auto",
              }}
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🔹 Main Content (scrollable only) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex-grow-1 position-relative"
          style={{
            overflowY: "auto",
            maxHeight: "calc(100vh - 50px)",
          }}
        >
          <Outlet />
        </motion.div>
      </div>

      {/* 🔹 Footer */}
      <motion.footer
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-dark text-white py-2"
        style={{
          fontSize: "0.9rem",
          letterSpacing: "0.5px",
          boxShadow: "0 -2px 5px rgba(0,0,0,0.3)",
        }}
      >
        <div className="container d-flex justify-content-between align-items-center">
          <span>© {new Date().getFullYear()} Inventory System</span>
          <span
            style={{
              fontStyle: "italic",
              fontWeight: "500",
              color: "#0dcaf0",
            }}
          >
            Code by:{" "}
            <span style={{ fontWeight: "700", color: "#ffc107" }}>@Ekim19</span>
          </span>
        </div>
      </motion.footer>
    </div>
  );
};

export default AppLayout;
