// Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./header.js";
import Footer from "./footer.js";
import Sidebar from "./sidebar.js";
import { CartProvider } from "../pages/cart.js";
import "./layout.css"; // ✅ new CSS file

const Layout = () => {
  return (
    <CartProvider>
      <div className="d-flex flex-column min-vh-100">
        <Header />

        <div className="d-flex flex-grow-1">
          {/* Sidebar has fixed width */}
          <div className="sidebar-fixed">
            <Sidebar />
          </div>

          <main className="flex-grow-1 p-3 bg-light">
            <Outlet />
          </main>
        </div>

        <Footer />
      </div>
    </CartProvider>
  );
};

export default Layout;
