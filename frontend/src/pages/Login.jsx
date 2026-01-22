import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import logo from "../assets/auth-pages-images/EMEXA Logo.png";
import api from "../lib/api";
import "./Form.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Show message from registration if exists
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      if (location.state?.email) {
        setEmail(location.state.email);
      }
    }
  }, [location]);

  const onSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    // Validation
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (email !== email.toLowerCase()) {
      newErrors.email = "Email must be in lowercase only";
    }
    if (!password) {
      newErrors.password = "Please enter your password";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    console.log("📤 Attempting login for:", email);

    api
      .post("/auth/login", { email, password })
      .then((res) => {
        console.log("✅ Login successful - FULL RESPONSE:", res);

        // CRITICAL FIX: Clear admin viewing flags for ALL logins
        console.log("🧹 Clearing admin preview flags...");
        localStorage.removeItem("adminViewingAs");
        sessionStorage.removeItem("adminViewingAs");
        console.log("✅ Admin preview flags cleared");

        // Check if user is admin - redirect to admin panel
        if (res.user?.role === "admin" || res.user?.role === "Admin") {
          const adminName = res.user?.name || "Admin";

          // Store admin token and user info
          localStorage.setItem("adminToken", res.token);
          localStorage.setItem("adminUser", JSON.stringify(res.user));
          localStorage.setItem("token", res.token);
          localStorage.setItem("user", JSON.stringify(res.user));
          localStorage.setItem("userName", adminName);
          localStorage.setItem("userRole", "admin");

          setSuccess(`✅ Login successful! Welcome ${adminName}!`);
          console.log("🚀 Navigating to admin panel");

          setTimeout(() => {
            navigate("/admin/user-management");
          }, 1000);
          return;
        }

        // Regular user flow (students and teachers)
        const userRole = res.user?.role || "student";
        let userName = "User";

        if (res.user) {
          userName =
            res.user.name ||
            res.user.fullName ||
            res.user.full_name ||
            res.user.userName ||
            res.user.username ||
            res.user.displayName ||
            res.user.display_name ||
            (res.user.email ? res.user.email.split("@")[0] : null) ||
            "User";
        }

        console.log("🔍 Extracted userName:", userName);

        // CRITICAL FIX: Clear adminToken for regular users
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        console.log("🧹 Cleared admin-specific storage for regular user");

        // Save token based on "Remember me" checkbox
        if (res.token) {
          if (remember) {
            localStorage.setItem("token", res.token);
            localStorage.setItem("rememberMe", "true");
            console.log("💾 Token saved to localStorage (remember me)");
          } else {
            sessionStorage.setItem("token", res.token);
            localStorage.setItem("token", res.token);
            localStorage.removeItem("rememberMe");
            console.log("💾 Token saved to sessionStorage (this session only)");
          }
        }

        // Save user data
        if (res.user) {
          const userData = {
            user: JSON.stringify(res.user),
            userName: userName,
            userRole: userRole,
            userEmail: res.user.email,
            userId: res.user.id || res.user._id,
          };

          Object.keys(userData).forEach((key) => {
            localStorage.setItem(key, userData[key]);
            console.log(`💾 localStorage.${key} =`, userData[key]);
          });
          
          // Clear any saved menu state to ensure dashboard shows first
          if (userRole === 'teacher') {
            localStorage.removeItem('teacherActiveMenuItem');
            console.log('🗑️ Cleared teacherActiveMenuItem to show dashboard first');
          }

          if (!remember) {
            Object.keys(userData).forEach((key) => {
              sessionStorage.setItem(key, userData[key]);
            });
          }

          console.log("✅ User data saved successfully");

          // Sync profile image
          try {
            const storageKey = userRole === 'admin' ? 'adminProfileImage' : 
                             (userRole === 'teacher' ? 'teacherProfileImage' : 'studentProfileImage');
            const eventName = `${storageKey}Changed`;

            const resProfileImage = res.user?.profileImage || res.user?.avatar || res.user?.image || null;
            if (resProfileImage) {
              localStorage.setItem(storageKey, resProfileImage);
              window.dispatchEvent(new CustomEvent(eventName, { detail: resProfileImage }));
            } else if (res.token) {
              fetch('http://localhost:5000/api/users/profile', {
                headers: { Authorization: `Bearer ${res.token}` }
              })
                .then(r => r.ok ? r.json() : Promise.reject(r))
                .then(profileData => {
                  const fetched = profileData?.profileImage || profileData?.avatar || profileData?.image || null;
                  if (fetched) {
                    localStorage.setItem(storageKey, fetched);
                    window.dispatchEvent(new CustomEvent(eventName, { detail: fetched }));
                  }
                })
                .catch(e => console.warn('Could not fetch profile after login:', e));
            }
          } catch (e) {
            console.warn('Error syncing profile image on login:', e);
          }

          // Sync settings
          try {
            if (res.user?.notificationSettings) {
              localStorage.setItem('notificationSettings', JSON.stringify(res.user.notificationSettings));
            }
            if (res.user?.privacySettings) {
              localStorage.setItem('privacySettings', JSON.stringify(res.user.privacySettings));
            }
          } catch (e) {
            console.warn('Error syncing settings on login:', e);
          }
        }

        // Show success message
        setSuccess(`✅ Login successful! Welcome back ${userName}!`);

        // Navigate based on user role
        let dashboardPath;
        const normalizedRole = (res.user?.role || "student").toLowerCase();

        if (normalizedRole === "teacher") {
          dashboardPath = "/teacher-dashboard";
        } else if (normalizedRole === "student") {
          dashboardPath = "/dashboard";
        } else {
          dashboardPath = "/dashboard";
        }

        console.log(`🚀 Navigating to ${dashboardPath} (role: ${normalizedRole})`);

        setTimeout(() => {
          navigate(dashboardPath);
        }, 1000);
      })
      .catch((err) => {
        console.error("❌ Login failed:", err);

        let errorMessage = "Login failed. Please check your credentials.";

        // Check for approval-related errors
        if (err.pendingApproval) {
          errorMessage = "⏳ Your account is pending admin approval. Please wait for approval before logging in.";
        } else if (err.rejected) {
          errorMessage = "❌ Your account registration was rejected. Please contact support.";
        } else if (err.isNetworkError) {
          errorMessage = "Cannot connect to server. Please check if backend is running.";
        } else if (err.message) {
          errorMessage = err.message;
        }

        setErrors({ form: errorMessage });
        setSuccess("");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="app-root">
      <div className="auth-container">
        <div className="brand">
          <img src={logo} alt="EMEXA logo" className="brand-logo" />
        </div>
        <div className="auth-title">Log in to your account</div>
        <div className="auth-sub">
          Enter your details to access your account
        </div>

        <div className="auth-inner">
          <form noValidate onSubmit={onSubmit}>
            {success && (
              <div
                style={{
                  padding: "12px",
                  marginBottom: "16px",
                  backgroundColor: success.includes("pending") ? "#fff3cd" : "#d4edda",
                  color: success.includes("pending") ? "#856404" : "#155724",
                  borderRadius: "8px",
                  border: success.includes("pending") ? "1px solid #ffeaa7" : "1px solid #c3e6cb",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                {success}
              </div>
            )}

            <div className={`field ${errors.email ? "error" : ""}`}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  const newEmail = e.target.value;
                  setEmail(newEmail);
                  setErrors({});

                  if (newEmail.trim()) {
                    if (!/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(newEmail)) {
                      setErrors((prev) => ({
                        ...prev,
                        email: "Please enter a valid email address",
                      }));
                    } else if (newEmail !== newEmail.toLowerCase()) {
                      setErrors((prev) => ({
                        ...prev,
                        email: "Email must be in lowercase only",
                      }));
                    }
                  }
                }}
                placeholder="Enter your email"
              />
              {errors.email && <div className="error-text">{errors.email}</div>}
            </div>

            <div className={`field ${errors.password ? "error" : ""}`}>
              <label>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({});
                  }}
                  placeholder="Enter your password"
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
                    padding: "0",
                    outline: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 0.2s ease",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#666" }}>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" style={{ stroke: "currentColor" }} />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#666" }}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="error-text">{errors.password}</div>
              )}
            </div>

            {errors.form && (
              <div
                style={{
                  padding: "12px",
                  marginTop: "8px",
                  marginBottom: "12px",
                  backgroundColor: errors.form.includes("pending") ? "#fff3cd" : "#fee",
                  color: errors.form.includes("pending") ? "#856404" : "#c0392b",
                  borderRadius: "8px",
                  border: errors.form.includes("pending") ? "1px solid #ffeaa7" : "1px solid #f5c6cb",
                  textAlign: "center",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                {errors.form}
              </div>
            )}

            <div className="actions">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />{" "}
                Remember me
              </label>
              <Link className="link" to="/forgot-password">
                Forgot your password?
              </Link>
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Log in"}
            </button>

            <div className="small-note">
              Don't have an account?{" "}
              <Link className="link" to="/register">
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}