// main.jsx
import App from "./App";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './index.css';
import "./pages/Form.css";
import Home from "./pages/Home";
import SecondPage from "./pages/SecondPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Logout from "./pages/Logout";
import LandingPage from "./pages/LandingPage";
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
        {/* FIRST RUN LOGIC */}
        <Route
          path="/"
          element={
            hasSeenLanding()
              ? <Navigate to="/login" replace />
              : <LandingPage />
          }
        />

        {/* All App.jsx routes */}
        <Route path="/*" element={<App />} />

        {/* Protected & other pages */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route path="/second" element={<SecondPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/logout" element={<Logout />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
