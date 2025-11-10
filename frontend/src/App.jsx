import { useEffect, useState } from "react";
import "./App.css";
import "./pages/auth/Forms.css";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Rejister";
import ForgotPassword from "./pages/auth/ForgotPassword";

export default function App() {
  const [route, setRoute] = useState(
    () => window.location.hash.replace("#", "") || "/login"
  );

  useEffect(() => {
    const onHash = () =>
      setRoute(window.location.hash.replace("#", "") || "/login");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const renderRoute = () => {
    if (route === "/register") return <Register />;
    if (route === "/forgot") return <ForgotPassword />;
    // default to login
    return <Login />;
  };

  return <div className="app-root">{renderRoute()}</div>;
}
