import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoIcon from '../assets/headerlogo.png';

const Header = ({ userName, userRole }) => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);

  const handleLogout = () => {
    // Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to log out?");
    
    if (confirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      navigate("/login");
    }
  };

  // Load profile image from localStorage and listen for changes
  useEffect(() => {
    // Initial load
    const storedImage = localStorage.getItem('profileImage');
    setProfileImage(storedImage);

    // Listen for profile image changes (same tab)
    const handleProfileImageChange = (e) => {
      console.log('Profile image change event received:', e.detail);
      setProfileImage(e.detail);
    };

    // Listen for storage changes (cross-tab)
    const handleStorageChange = () => {
      const updatedImage = localStorage.getItem('profileImage');
      setProfileImage(updatedImage);
    };

    window.addEventListener('profileImageChanged', handleProfileImageChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('profileImageChanged', handleProfileImageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 h-14 z-50">
      <div className="h-full flex items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img 
            src={LogoIcon}
            alt="Logo" 
            className="w-34 h-34 object-contain"
          />
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-1">
          {/* Notifications */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          {/* Help */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* User Profile - Display Only */}
          <div className="relative">
            <div className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition ml-1">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={userName || 'User'}
                  className="w-7 h-7 rounded-full object-cover shadow-sm"
                />
              ) : (
                <div
                  className={`w-7 h-7 ${
                    userRole === "teacher" ? "bg-purple-600" : "bg-blue-600"
                  } rounded-full flex items-center justify-center text-white font-semibold text-xs`}
                >
                  {userName?.charAt(0).toUpperCase() || "A"}
                </div>
              )}
              <span className="font-medium text-gray-900 text-sm">
                {userName || "User"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
