// ------------------------------
// main.jsx
// ------------------------------

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Routing
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Global Styles
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./index.css";        
import "./pages/Form.css";   

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Logout from "./pages/Logout";

// Dashboard & Quiz
import StudentDashboard from "./pages/stdashboard"; 
import QuizPage from "./pages/quizpage";

// Auth Protection Component
import RequireAuth from "./components/RequireAuth";


// ------------------------------
// FINAL: ALWAYS show Landing first
// ------------------------------
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>

        {/* ------------------------------
            Landing Page (Always First Page)
        ------------------------------ */}
        <Route path="/" element={<LandingPage />} />

        {/* ------------------------------
            Auth Routes
        ------------------------------ */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/logout" element={<Logout />} />

        {/* ------------------------------
            Dashboard Routes (Protected)
        ------------------------------ */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <StudentDashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <StudentDashboard />
            </RequireAuth>
          }
        />

        {/* Redirect old path */}
        <Route
          path="/student-dashboard"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* ------------------------------
            Quiz Route (Protected)
        ------------------------------ */}
        <Route
          path="/quiz/:quizId"
          element={
            <RequireAuth>
              <QuizPage />
            </RequireAuth>
          }
        />

        {/* ------------------------------
            Fallback Route
        ------------------------------ */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  </StrictMode>
);
