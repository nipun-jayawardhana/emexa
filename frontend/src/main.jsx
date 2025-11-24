import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./index.css";
import "./pages/Form.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot" element={<Navigate to="/forgot-password" replace />} />
        <Route path="/logout" element={<Logout />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/user-management" element={<UserManagement />} />
        
        {/* Student Routes */}
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
        
        <Route
          path="/home"
          element={
            <RequireAuth allowedRoles={["student"]}>
              <StudentDashboard />
            </RequireAuth>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <RequireAuth allowedRoles={["student"]}>
              <StudentDashboard />
            </RequireAuth>
          }
        />
        
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route path="/student-dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/stdashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);