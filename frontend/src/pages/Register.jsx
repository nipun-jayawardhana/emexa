import { useState } from "react";
import logo from "../assets/auth-pages-images/EMEXA Logo.png";
import api from "../lib/api";
import { useNavigate, Link } from "react-router-dom";
import "./Form.css";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accountType, setAccountType] = useState("student");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!fullName.trim()) {
      e.fullName = "Full name is required";
    }
    if (!email.trim()) {
      e.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      e.email = "Please enter a valid email address";
    }
    if (!password) {
      e.password = "Password is required";
    } else if (password.length < 8) {
      e.password = "Password must be at least 8 characters";
    }
    if (!confirm) {
      e.confirm = "Please confirm your password";
    } else if (password !== confirm) {
      e.confirm = "Passwords do not match";
    }
    return e;
  };

  const onSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setLoading(true);

      // Clear any previous errors
      setErrors({});

      // Log what we're sending to backend
      console.log("📤 Sending registration to backend:", {
        fullName,
        email,
        password: "***",
        accountType,
      });
      // Note: API base is provided by Vite env VITE_API_URL, default is http://localhost:5000/api
      console.log(
        "📍 Backend URL (example):",
        "http://localhost:5000/api/auth/register"
      );

      api
        .post("/auth/register", { fullName, email, password, accountType })
        .then((res) => {
          // Save token and user
          if (res.token) localStorage.setItem("token", res.token);
          if (res.user) localStorage.setItem("user", JSON.stringify(res.user));

          // Use returned user name field
          setUserName(res.user?.name || "");
          setRegistered(true);

          // Navigate to home
          navigate("/Login");
        })
        .catch((err) => {
          console.error("❌ Registration error:", err);

          let errorMessage = "Registration failed. Please try again.";

          // Detect network failure (fetch throws), or HTTP errors where message is available
          if (err.message && err.message.startsWith("HTTP")) {
            // Generic HTTP error (e.g. HTTP 409)
            errorMessage = `Server returned an error (${err.message})`;
          } else if (err.isNetworkError) {
            errorMessage =
              "⚠️ Cannot connect to server. Please check if backend is running on http://localhost:5000";
          } else if (err.message) {
            errorMessage = err.message;
          }

          setErrors({ form: errorMessage });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <div className="app-root">
      <div className="auth-container">
        {!registered ? (
          <>
            <div className="brand">
              <img src={logo} alt="EMEXA logo" className="brand-logo" />
            </div>
            <div className="auth-title">Create your account</div>

            <div className="auth-inner">
              <form noValidate onSubmit={onSubmit}>
                <div className={`field ${errors.fullName ? "error" : ""}`}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <div className="error-text">{errors.fullName}</div>
                  )}
                </div>

                <div className={`field ${errors.email ? "error" : ""}`}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <div className="error-text">{errors.email}</div>
                  )}
                </div>

                <div className={`field ${errors.password ? "error" : ""}`}>
                  <label>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
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
                        outline: "none",
                        lineHeight: "1",
                        transition: "color 0.2s ease",
                      }}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="error-text">{errors.password}</div>
                  )}
                </div>

                <div className={`field ${errors.confirm ? "error" : ""}`}>
                  <label>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Confirm your password"
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
                        outline: "none",
                        lineHeight: "1",
                        transition: "color 0.2s ease",
                      }}
                      aria-label={
                        showConfirm ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirm ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {errors.confirm && (
                    <div className="error-text">{errors.confirm}</div>
                  )}
                </div>

                <div className="field">
                  <label>Account Type</label>
                  <div className="radio-row">
                    <label>
                      <input
                        type="radio"
                        name="acct"
                        checked={accountType === "student"}
                        onChange={() => setAccountType("student")}
                      />{" "}
                      Student
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="acct"
                        checked={accountType === "teacher"}
                        onChange={() => setAccountType("teacher")}
                      />{" "}
                      Teacher
                    </label>
                  </div>
                </div>

                {errors.form && (
                  <div
                    style={{
                      padding: "12px",
                      marginTop: "12px",
                      marginBottom: "8px",
                      backgroundColor: "#f8d7da",
                      color: "#721c24",
                      borderRadius: "8px",
                      border: "1px solid #f5c6cb",
                      textAlign: "center",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {errors.form}
                  </div>
                )}

                <button
                  className="btn"
                  type="submit"
                  disabled={loading}
                  style={{
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                    position: "relative",
                  }}
                >
                  {loading ? (
                    <span>
                      <span
                        style={{
                          display: "inline-block",
                          width: "16px",
                          height: "16px",
                          border: "2px solid #ffffff",
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          animation: "spin 0.6s linear infinite",
                          marginRight: "8px",
                          verticalAlign: "middle",
                        }}
                      ></span>
                      Registering...
                    </span>
                  ) : (
                    "Register"
                  )}
                </button>

                <div className="small-note">
                  Already have an account?{" "}
                  <Link className="link" to="/login">
                    Log in
                  </Link>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="success-message-container">
            <div className="brand">
              <img src={logo} alt="EMEXA logo" className="brand-logo" />
            </div>

            <div className="success-card">
              <div className="success-icon">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  <circle
                    cx="30"
                    cy="30"
                    r="28"
                    fill="#155724"
                    stroke="#155724"
                    strokeWidth="2"
                  />
                  <path
                    d="M20 30L26 36L40 22"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2 className="success-title">Registration Successful!</h2>

              <p className="success-subtitle">
                Welcome {userName}! Your account has been created successfully.
                Redirecting to login page...
              </p>
            </div>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <Link className="link" to="/login">
                Go to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
