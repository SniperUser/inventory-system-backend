import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const location = useLocation();

  // ✅ Function to check access
  const checkAccess = () => {
    const token = localStorage.getItem("token");
    const expiry = localStorage.getItem("tokenExpiry");
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role;

    // Token valid
    const isTokenValid = token && (!expiry || Date.now() < parseInt(expiry));

    // Role allowed: only check if allowedRoles passed (admin routes)
    const isRoleAllowed = !allowedRoles || allowedRoles.includes(role);

    return isTokenValid && isRoleAllowed;
  };

  useEffect(() => {
    if (checkAccess()) {
      setIsAllowed(true);
    } else {
      // Clear session if access denied
      // Regular users cannot access admin routes
      // Admin routes must pass allowedRoles=["admin"]
      setIsAllowed(false);
    }
    setIsLoading(false);
  }, [allowedRoles, location.pathname]);

  if (isLoading) return null;

  // ✅ If not allowed, redirect user to POS or login
  return isAllowed ? (
    children
  ) : (
    <Navigate
      to={localStorage.getItem("user")?.role === "Admin" ? "/home" : "/pos"}
      replace
      state={{ from: location }}
    />
  );
};

export default ProtectedRoute;
