import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Wrap any route that requires a logged-in user.
// Usage: <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
export const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
};

// Wrap any route that requires an admin account. Non-admin logged-in users
// are bounced home rather than to /login (they're authenticated, just not
// authorized), which avoids a confusing "please login" loop.
export const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};
