import App from './App';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import "./pages/Form.css";
import Home from "./pages/Home";
import SecondPage from "./pages/SecondPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Logout from "./pages/Logout";
import RequireAuth from "./components/RequireAuth";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <div className="app-root">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />
          <Route path="/second" element={<SecondPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  </StrictMode>
);
