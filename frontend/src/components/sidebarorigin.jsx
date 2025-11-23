import React from "react";
import { useNavigate } from "react-router-dom";
import dashboardIcon from '../assets/Dashboard.png';
import wellnessIcon from '../assets/Wellness.png';
import profileIcon from '../assets/Profile.png';

const Sidebar = ({ activeMenuItem, setActiveMenuItem, menuItems }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/login");
  };

  // Handle menu item click - supports both onClick and direct state update
  const handleMenuClick = (item) => {
    // Update active menu item
    if (setActiveMenuItem) {
      setActiveMenuItem(item.id);
    }
    
    // If item has onClick handler, call it
    if (item.onClick) {
      item.onClick();
    }
  };

  // Default menu items if none provided (for backward compatibility)
  const defaultMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <img 
            src={dashboardIcon}
            alt="Dashboard icon" 
            className="w-5 h-5 object-contain"
        />
      ),
    },
    {
      id: "wellness",
      label: "Wellness Centre",
      icon: (
        <img 
            src={wellnessIcon}
            alt="Wellness icon" 
            className="w-5 h-5 object-contain"
       />
        
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: (
        <img 
            src={profileIcon}
            alt="Profile icon" 
            className="w-5 h-5 object-contain"
        />
      ),
    },
  ];

  const items = menuItems || defaultMenuItems;

  return (
    <div className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-52 bg-gradient-to-b from-green-50 via-green-50 to-white border-r border-gray-200 overflow-y-auto">
      {/* Menu Items */}
      <nav className="pt-4 px-3 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item)}
            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg transition text-sm whitespace-nowrap ${
              activeMenuItem === item.id
                ? "bg-white text-green-600 shadow-sm font-medium"
                : "text-gray-700 hover:bg-white/70"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="absolute bottom-4 left-3 right-3 flex items-center space-x-2.5 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition text-sm"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span>Log Out</span>
      </button>
    </div>
  );
};

export default Sidebar;