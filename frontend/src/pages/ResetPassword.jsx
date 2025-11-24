import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/auth-pages-images/EMEXA Logo.png";
import api from "../lib/api";
import "./Form.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";
  const tokenFromUrl = searchParams.get("token") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    // Validation
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    }
    if (!token.trim()) {
      newErrors.token = "Reset code is required";
    }
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    console.log("📤 Resetting password for:", email);

    api
      .post("/auth/reset-password", { email, token, newPassword })
      .then((res) => {
        console.log("✅ Password reset successful:", res);
        setSuccess("✅ Password reset successful! Redirecting to login...");

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      })
      .catch((err) => {
        console.error("❌ Password reset failed:", err);

        let errorMessage = "Failed to reset password. Please try again.";

        if (err.isNetworkError) {
          errorMessage =
            "Cannot connect to server. Please check if backend is running.";
        } else if (err.message) {
          errorMessage = err.message;
        }

        setErrors({ form: errorMessage });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="app-root">
      <div className="auth-container">
        <div className="brand">
          <img src={logo} alt="EMEXA logo" className="brand-logo" />
        </div>
        <div className="auth-title">Reset Your Password</div>
        <div className="auth-sub">
          Enter the reset code sent to your email and your new password
        </div>

        <div className="auth-inner">
          <form noValidate onSubmit={onSubmit}>
            {success && (
              <div
                style={{
                  padding: "12px",
                  marginBottom: "16px",
                  backgroundColor: "#d4edda",
                  color: "#155724",
                  borderRadius: "8px",
                  border: "1px solid #c3e6cb",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                {success}
              </div>
            )}

            <div className={`field ${errors.email ? "error" : ""}`}>
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({});
                }}
                placeholder="Enter your email"
              />
              {errors.email && <div className="error-text">{errors.email}</div>}
            </div>

            <div className={`field ${errors.token ? "error" : ""}`}>
              <label>Reset Code</label>
              <input
                type="text"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setErrors({});
                }}
                placeholder="Enter 6-digit code"
                maxLength="6"
              />
              {errors.token && <div className="error-text">{errors.token}</div>}
            </div>

            <div className={`field ${errors.newPassword ? "error" : ""}`}>
              <label>New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors({});
                  }}
                  placeholder="Enter new password (min 8 characters)"
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "20px",
                    color: "#888",
                    padding: "0",
                  }}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.newPassword && (
                <div className="error-text">{errors.newPassword}</div>
              )}
            </div>

            <div className={`field ${errors.confirmPassword ? "error" : ""}`}>
              <label>Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({});
                  }}
                  placeholder="Confirm new password"
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "20px",
                    color: "#888",
                    padding: "0",
                  }}
                >
                  {showConfirm ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="error-text">{errors.confirmPassword}</div>
              )}
            </div>

            {errors.form && (
              <div
                style={{
                  padding: "12px",
                  marginTop: "8px",
                  marginBottom: "12px",
                  backgroundColor: "#fee",
                  color: "#c0392b",
                  borderRadius: "8px",
                  border: "1px solid #f5c6cb",
                  textAlign: "center",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                ❌ {errors.form}
              </div>
            )}

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="small-note" style={{ marginTop: "12px" }}>
              Remember your password?{" "}
              <a className="link" href="/login">
                Back to Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
