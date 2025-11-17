// App.jsx
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import StudentDashboard from "./pages/StudentDashboard";
<div className="bg-red-500 text-white p-4">Test Tailwind</div>


export default function App() {
  return (
    <Routes>
      {/* Landing page */}
      <Route path="/landing" element={<LandingPage />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Dashboard */}
      <Route path="/student-dashboard" element={<StudentDashboard />} />
    </Routes>
  );
}
