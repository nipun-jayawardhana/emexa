// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import './index.css'; // This imports Tailwind
import "./pages/Form.css";

import Home from "./pages/Home";
import SecondPage from "./pages/SecondPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Logout from "./pages/Logout";
import LandingPage from "./pages/LandingPage";
import StudentDashboard from "./pages/stdashboard";
import QuizPage from "./pages/quizpage"; 
import RequireAuth from "./components/RequireAuth";

const hasSeenLanding = () => {
  try {
    return localStorage.getItem("seenLanding") === "true";
  } catch {
    return false;
  }
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Landing page - first visit */}
        <Route
          path="/"
          element={
            hasSeenLanding()
              ? <Navigate to="/login" replace />
              : <LandingPage />
          }
        />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/logout" element={<Logout />} />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        
        {/* Dashboard route - Protected */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <StudentDashboard />
            </RequireAuth>
          }
        />
        
        {/* Quiz route - Protected - NEW */}
        <Route
          path="/quiz/:quizId"
          element={
            <RequireAuth>
              <QuizPage />
            </RequireAuth>
          }
        />
        
        {/* Legacy dashboard route - redirect to /dashboard */}
        <Route path="/student-dashboard" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/second" element={<SecondPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);