import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login"; // Import Login page
import LandingPage from "./pages/LandingPage";
import StudentDashboard from "./pages/StudentDashboard";

export default function App() {
  return (
    <Routes>
      {/* Default route points to Login page */}
      <Route path="/" element={<Login />} />

      {/* Other routes */}
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />

      {/* Redirect unknown routes to login page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
