import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
        console.log("👤 User object:", res.user);
        console.log(
          "🔍 User object keys:",
          res.user ? Object.keys(res.user) : "no user"
        );

        // CRITICAL FIX: Clear admin viewing flags for ALL logins
        console.log("🧹 Clearing admin preview flags...");
        localStorage.removeItem("adminViewingAs");
        sessionStorage.removeItem("adminViewingAs");
        console.log("✅ Admin preview flags cleared");

        // Check if user is admin - redirect to admin panel
        if (res.user?.role === "admin" || res.user?.role === "Admin") {
          const adminName =
            res.user?.name ||
            res.user?.fullName ||
            res.user?.full_name ||
            "Admin";

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

        // COMPREHENSIVE userName extraction - try ALL possible field names
        let userName = "User"; // Default fallback

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
        console.log(
          "🔍 From field:",
          res.user?.name
            ? "name"
            : res.user?.fullName
            ? "fullName"
            : res.user?.full_name
            ? "full_name"
            : "email fallback"
        );

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

        // Save user data to BOTH localStorage and sessionStorage for compatibility
        if (res.user) {
          const userData = {
            user: JSON.stringify(res.user),
            userName: userName,
            userRole: userRole,
            userEmail: res.user.email,
            userId: res.user.id || res.user._id,
          };

          // Always save to localStorage for compatibility
          Object.keys(userData).forEach((key) => {
            localStorage.setItem(key, userData[key]);
            console.log(`💾 localStorage.${key} =`, userData[key]);
          });
          
          // Clear any saved menu state to ensure dashboard shows first
          if (userRole === 'teacher') {
            localStorage.removeItem('teacherActiveMenuItem');
            console.log('🗑️ Cleared teacherActiveMenuItem to show dashboard first');
          }

          // Also save to sessionStorage if not "remember me"
          if (!remember) {
            Object.keys(userData).forEach((key) => {
              sessionStorage.setItem(key, userData[key]);
            });
          }

          console.log("✅ User data saved successfully");

          // --- Sync profile image into localStorage so other devices/tabs update ---
          try {
            const storageKey = userRole === 'admin' ? 'adminProfileImage' : (userRole === 'teacher' ? 'teacherProfileImage' : 'studentProfileImage');
            const eventName = `${storageKey}Changed`;

            const resProfileImage = res.user?.profileImage || res.user?.avatar || res.user?.image || null;
            if (resProfileImage) {
              localStorage.setItem(storageKey, resProfileImage);
              window.dispatchEvent(new CustomEvent(eventName, { detail: resProfileImage }));
              console.log('Profile image updated from login response:', resProfileImage);
            } else if (res.token) {
              // If login response didn't include profile image, fetch fresh profile
              fetch('http://localhost:5000/api/users/profile', {
                headers: { Authorization: `Bearer ${res.token}` }
              })
                .then(r => r.ok ? r.json() : Promise.reject(r))
                .then(profileData => {
                  const fetched = profileData?.profileImage || profileData?.avatar || profileData?.image || null;
                  if (fetched) {
                    localStorage.setItem(storageKey, fetched);
                    window.dispatchEvent(new CustomEvent(eventName, { detail: fetched }));
                    console.log('Profile image fetched after login and saved:', fetched);
                  }
                })
                .catch(e => console.warn('Could not fetch profile after login:', e));
            }
          } catch (e) {
            console.warn('Error syncing profile image on login:', e);
          }

          // --- Sync notification and privacy settings to localStorage ---
          try {
            if (res.user?.notificationSettings) {
              localStorage.setItem('notificationSettings', JSON.stringify(res.user.notificationSettings));
              console.log('✅ Notification settings saved:', res.user.notificationSettings);
            }
            if (res.user?.privacySettings) {
              localStorage.setItem('privacySettings', JSON.stringify(res.user.privacySettings));
              console.log('✅ Privacy settings saved:', res.user.privacySettings);
            }
          } catch (e) {
            console.warn('Error syncing settings on login:', e);
          }

          // VERIFICATION: Read back what we just saved
          console.log("📦 VERIFICATION - What's in localStorage:");
          console.log("  - userName:", localStorage.getItem("userName"));
          console.log("  - userRole:", localStorage.getItem("userRole"));
          console.log("  - adminToken:", localStorage.getItem("adminToken"));
          console.log(
            "  - adminViewingAs:",
            localStorage.getItem("adminViewingAs")
          );
          console.log(
            "  - user object:",
            JSON.parse(localStorage.getItem("user") || "{}")
          );
          console.log(
            "  - user object:",
            JSON.parse(localStorage.getItem("user") || "{}")
          );
        }

        // Show success message
        setSuccess(`✅ Login successful! Welcome back ${userName}!`);

        // Navigate based on user role
        let dashboardPath;
        const normalizedRole = (res.user?.role || "student").toLowerCase();

        if (normalizedRole === "teacher") {
          dashboardPath = "/teacher-dashboard";
          console.log("🎓 Redirecting to teacher dashboard");
        } else if (normalizedRole === "student") {
          dashboardPath = "/dashboard";
          console.log("👨‍🎓 Redirecting to student dashboard");
        } else {
          dashboardPath = "/dashboard";
          console.log("❓ Unknown role, redirecting to student dashboard");
        }

        console.log(
          `🚀 Navigating to ${dashboardPath} (role: ${normalizedRole})`
        );

        // Delay navigation slightly to show success message
        setTimeout(() => {
          navigate(dashboardPath, { replace: true });
        }, 1000);
      })
      .catch((err) => {
        console.error("❌ Login failed:", err);

        let errorMessage = "Login failed. Please check your credentials.";

        if (err.isNetworkError) {
          errorMessage =
            "Cannot connect to server. Please check if backend is running.";
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
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  const newEmail = e.target.value;
                  setEmail(newEmail);
                  setErrors({});

                  // Real-time validation
                  if (newEmail.trim()) {
                    // Check basic format
                    if (
                      !/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                        newEmail
                      )
                    ) {
                      setErrors((prev) => ({
                        ...prev,
                        email: "Please enter a valid email address",
                      }));
                    } else if (newEmail !== newEmail.toLowerCase()) {
                      setErrors((prev) => ({
                        ...prev,
                        email: "Email must be in lowercase only",
                      }));
                    } else {
                      // Validate TLD against whitelist
                      const tld = newEmail.split(".").pop().toLowerCase();
                      const validTLDs = [
                        "com",
                        "org",
                        "net",
                        "edu",
                        "gov",
                        "mil",
                        "int",
                        "co",
                        "uk",
                        "us",
                        "ca",
                        "au",
                        "de",
                        "fr",
                        "jp",
                        "cn",
                        "in",
                        "br",
                        "ru",
                        "za",
                        "es",
                        "it",
                        "nl",
                        "se",
                        "no",
                        "dk",
                        "fi",
                        "be",
                        "ch",
                        "at",
                        "nz",
                        "sg",
                        "hk",
                        "kr",
                        "tw",
                        "mx",
                        "ar",
                        "cl",
                        "info",
                        "biz",
                        "io",
                        "ai",
                        "app",
                        "dev",
                        "tech",
                        "online",
                        "site",
                        "website",
                        "space",
                        "store",
                        "club",
                        "xyz",
                        "top",
                        "pro",
                        "name",
                        "me",
                        "tv",
                        "cc",
                        "ws",
                        "mobi",
                        "asia",
                        "tel",
                        "travel",
                        "museum",
                        "coop",
                        "aero",
                        "jobs",
                        "cat",
                      ];

                      if (!validTLDs.includes(tld)) {
                        setErrors((prev) => ({
                          ...prev,
                          email: "Please enter a valid email address",
                        }));
                      }
                    }
                  }
                }}
                onBlur={(e) => {
                  const emailValue = e.target.value.trim();
                  if (
                    emailValue &&
                    !/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                      emailValue
                    )
                  ) {
                    setErrors((prev) => ({
                      ...prev,
                      email: "Please enter a valid email address",
                    }));
                  } else if (
                    emailValue &&
                    emailValue !== emailValue.toLowerCase()
                  ) {
                    setErrors((prev) => ({
                      ...prev,
                      email: "Email must be in lowercase only",
                    }));
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
                    fontSize: "20px",
                    color: "#888",
                    padding: "0",
                    outline: "none",
                    lineHeight: "1",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#333";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#888";
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
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
