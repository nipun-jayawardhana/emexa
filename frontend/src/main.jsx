import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./index.css";
import "./pages/Form.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import Logout from "./pages/Logout";
import LandingPage from "./pages/LandingPage";
import StudentDashboard from "./pages/stdashboard";
import QuizPage from "./pages/quizpage";
import AdminLogin from "./pages/AdminLogin";
import UserManagement from "./pages/usermgt";
import TeacherDashboard from "./pages/TeacherDashboard";
import Permission from "./pages/Permission";
import WellnessCentre from "./pages/WellnessCentre";
import RequireAuth from "./components/RequireAuth";
import ProtectedRoute from "./components/ProtectedRoute";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/change-password"
          element={
            <RequireAuth allowedRoles={["student", "teacher"]}>
              <ChangePassword />
            </RequireAuth>
          }
        />
        <Route
          path="/forgot"
          element={<Navigate to="/forgot-password" replace />}
        />
        <Route path="/logout" element={<Logout />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/user-management"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={<Navigate to="/admin/user-management" replace />}
        />

        <Route path="/admin/user-management" element={<UserManagement />} />

        {/* Permission Route */}
        <Route path="/permission" element={<Permission />} />

        {/* Teacher Routes - Accessible by teacher AND admin */}
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute allowedRoles={["teacher", "admin"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Routes - Accessible by student AND admin */}
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["student", "admin"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student", "admin"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Wellness Centre - ONLY for student, BLOCKED for admin */}
        <Route
          path="/wellness-centre"
          element={
            <ProtectedRoute allowedRoles={["student"]} blockWellness={true}>
              <WellnessCentre />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz/:quizId"
          element={
            <ProtectedRoute allowedRoles={["student", "admin"]}>
              <QuizPage />
            </ProtectedRoute>
          }
        />

        {/* Legacy Redirects */}
        <Route
          path="/student-dashboard"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/stdashboard"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* 404 Catch-all */}

        {/* Redirects */}
        <Route
          path="/student-dashboard"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/stdashboard"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
