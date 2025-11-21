import React, { useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Public
import LoginPage from "./admin/pages/LoginPage.js";

// Protected Admin Pages
import Home from "./admin/components/Dashboard/Home.js";
import Employee from "./admin/pages/Employee.js";
import Stock from "./admin/pages/Stock.js";
import Supplier from "./admin/pages/Supplier.js";
import Sales from "./admin/pages/Sales.js";
import Delivery from "./admin/pages/Delivery.js";
import DoneDelivery from "./admin/pages/DoneDelivery.js";
import Login from "./admin/pages/Login.js";
import Register from "./admin/pages/Register.js";
import Return from "./admin/pages/Return.js";
import Archived from "./admin/pages/ArchivePage.js";
import NotificationPage from "./admin/pages/NotificationPage.js";
import ProtectedRoute from "./admin/components/ProtectedRoute.js";
import AppLayout from "./admin/layout/layout.js";

// Email
import EmailLayout from "./admin/pages/email/EmailLayout.js";
import Inbox from "./admin/pages/email/Inbox.js";
import Sent from "./admin/pages/email/Sent.js";
import Drafts from "./admin/pages/email/Drafts.js";
import Trash from "./admin/pages/email/Trash.js";
import Compose from "./admin/pages/email/Composed.js";

import { EmailProvider } from "./admin/context/EmailContext.js";

// POS Layout (separate from admin)
import POSLayout from "./FrontendPOS/components/layout.js";
import Detail from "./FrontendPOS/components/detail.js";
import CartPage from "./FrontendPOS/pages/viewCart.js";
import Checkout from "./FrontendPOS/pages/Checkout.js";
import LandingPage from "./FrontendPOS/pages/Landing.js";

// For Product filtering POS
import CanGoods from "./FrontendPOS/ProductList/CanGoods.js";
import InstantNoodles from "./FrontendPOS/ProductList/InstantNoodles.js";
import Snacks from "./FrontendPOS/ProductList/Snacks.js";
import Drinks from "./FrontendPOS/ProductList/Drinks.js";
import Rice from "./FrontendPOS/ProductList/Rice.js";
import Condiments from "./FrontendPOS/ProductList/Condiment.js";
import FrozenGoods from "./FrontendPOS/ProductList/FrozenGoods.js";
import PersonalCare from "./FrontendPOS/ProductList/PersonalCare.js";
import Laundry from "./FrontendPOS/ProductList/Laundry.js";
import HouseHold from "./FrontendPOS/ProductList/HouseHold.js";

//for cashoering
import CashierLayout from "./FrontendPOS/Cashiering/cashierLayout.js";

//for delivery
import Staffdelivery from "./FrontendPOS/Delivery/deliveryLayout.js";

function App() {
  useEffect(() => {
    const alreadyInitialized = sessionStorage.getItem("appInitialized");
    if (!alreadyInitialized) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");
      sessionStorage.setItem("appInitialized", "true");
    }
  }, []);

  return (
    <EmailProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/loginPage" replace />} />
          <Route path="/loginPage" element={<LoginPage />} />

          {/*for testing */}
          <Route path="/cashier" element={<CashierLayout />} />
          <Route path="/delivery" element={<Staffdelivery />} />
          {/*for testing */}

          {/* ✅ Protected POS Routes (all roles allowed) */}
          <Route
            path="/pos"
            element={
              <ProtectedRoute>
                <LandingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pos/detail/*"
            element={
              <ProtectedRoute>
                <POSLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Detail />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="can-goods" element={<CanGoods />} />
            <Route path="instant-noodles" element={<InstantNoodles />} />
            <Route path="snacks" element={<Snacks />} />
            <Route path="drinks" element={<Drinks />} />
            <Route path="rice" element={<Rice />} />
            <Route path="condiments" element={<Condiments />} />
            <Route path="frozen-goods" element={<FrozenGoods />} />
            <Route path="personal-care" element={<PersonalCare />} />
            <Route path="laundry" element={<Laundry />} />
            <Route path="household" element={<HouseHold />} />
          </Route>

          {/* ✅ Protected Admin Routes (only admin role allowed) */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/employee" element={<Employee />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/supplier" element={<Supplier />} />
            <Route path="/sales/main" element={<Sales />} />
            <Route path="/sales/delivery" element={<Delivery />} />
            <Route path="/sales/done-delivery" element={<DoneDelivery />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/sales/return" element={<Return />} />
            <Route path="/archived" element={<Archived type="sales" />} />
            <Route path="/notifications" element={<NotificationPage />} />

            {/* Email under Admin layout */}
            <Route path="/email" element={<EmailLayout />}>
              <Route index element={<Compose />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="sent" element={<Sent />} />
              <Route path="drafts" element={<Drafts />} />
              <Route path="trash" element={<Trash />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </EmailProvider>
  );
}

export default App;
