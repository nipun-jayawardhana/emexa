import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const user =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
