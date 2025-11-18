import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/auth-pages-images/EMEXA Logo.png";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear auth token on logout
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("user");
    } catch {
      // ignore
    }
  }, []);

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="auth-container" style={{ padding: "2rem" }}>
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}
      >
        <img
          src={logo}
          alt="EMEXA logo"
          style={{ height: 72, opacity: 0.95 }}
        />
      </div>

      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          background: "var(--card-bg, #ffffff)",
          borderRadius: 12,
          padding: "40px 48px",
          boxShadow: "0 8px 30px rgba(20,20,20,0.08)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 90,
            height: 90,
            borderRadius: 9999,
            background: "#eaf7ee",
            margin: "0 auto 18px",
          }}
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="12" fill="#cff3dc" />
            <path
              d="M7.5 12.5L10.2 15.2L16.5 9"
              stroke="#166A3A"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 style={{ margin: "8px 0 12px", fontSize: 22, color: "#0f1720" }}>
          Successfully Logged Out
        </h2>

        <p style={{ margin: "0 0 18px", color: "#59636a", lineHeight: 1.6 }}>
          You have been safely logged out of your account.
          <br />
          Thank you for using our platform!
        </p>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            className="btn"
            onClick={goToLogin}
            style={{
              backgroundColor: "#196b4f",
              color: "white",
              padding: "12px 36px",
              borderRadius: 10,
              fontSize: 16,
              minWidth: 220,
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            Log Back In
          </button>
        </div>
      </div>
    </div>
  );
}
