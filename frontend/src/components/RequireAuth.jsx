import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children, allowedRoles = [] }) {
  const location = useLocation();
  
  // Get authentication data from localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const userRole = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;

  // If no token or user, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is specified and user's role is not in the list
  if (allowedRoles.length > 0 && userRole) {
    // Check if user's role is allowed
    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on user's actual role
      if (userRole === "teacher") {
        return <Navigate to="/teacher-dashboard" replace />;
      } else if (userRole === "student") {
        return <Navigate to="/dashboard" replace />;
      } else {
        // Unknown role, redirect to login
        return <Navigate to="/login" state={{ from: location }} replace />;
      }
    }
  }

  // User is authenticated and has proper role (if specified)
  return children;
}