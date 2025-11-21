// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./index.css"; // This imports Tailwind
import "./pages/Form.css";

// Note: `Home` and `SecondPage` were removed/renamed in the pages folder.
// Use the existing `StudentDashboard` component for protected dashboard routes.
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Logout from "./pages/Logout";
import LandingPage from "./pages/LandingPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import QuizPage from "./pages/quizpage";
import StudentDashboard from "./pages/stdashboard";
import Permission from "./pages/Permission";
import RequireAuth from "./components/RequireAuth";

// In development it's convenient to always show the landing page.
// Vite exposes `import.meta.env.DEV` which is true in dev mode.
const hasSeenLanding = () => {
  try {
    // Force showing landing during development for easier iteration
    if (import.meta.env && import.meta.env.DEV) return false;
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
            hasSeenLanding() ? (
              <Navigate to="/login" replace />
            ) : (
              <LandingPage />
            )
          }
        />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/permission" element={<Permission />} />

        {/* Protected routes: use `StudentDashboard` for authenticated users */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <StudentDashboard />
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

        {/* Teacher Dashboard route - Protected */}
        <Route
          path="/teacher-dashboard"
          element={
            <RequireAuth>
              <TeacherDashboard />
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
        <Route
          path="/student-dashboard"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* removed /second route (no matching component file) */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
