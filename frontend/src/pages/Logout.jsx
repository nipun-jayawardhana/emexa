import { useNavigate } from "react-router-dom";
import logo from "../assets/auth-pages-images/EMEXA Logo.png";

export default function Logout() {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src={logo}
            alt="EMEXA logo"
            className="w -30 h-30"
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-3">
            Successfully Logged Out
          </h2>

          {/* Message */}
          <p className="text-gray-600 text-center mb-8 leading-relaxed">
            You have been safely logged out of your account.
            <br />
            Thank you for using our platform!
          </p>

          {/* Login Button */}
          <button
            onClick={goToLogin}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Log Back In
          </button>
        </div>
      </div>
    </div>
  );
}