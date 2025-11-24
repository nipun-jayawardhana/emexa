import React, { useState } from "react";
import { Camera } from "lucide-react";
import tProfile from "../assets/t-profile.png";

const TeacherProfile = ({ embedded = false, frame = null }) => {
  const [activeMenuItem, setActiveMenuItem] = useState("profile");
  const [activeTab, setActiveTab] = useState("Account Info");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "Sarah Johnson",
    email: "sarah.johnson@school.edu",
    role: "Teacher"
  });

  const userName = "Sarah";
  const userRole = "teacher";

  const tabs = ["Account Info", "Settings", "Activity", "Privacy & Data"];

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: "quizzes",
      label: "Quizzes",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "wellness",
      label: "Wellness Centre",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = () => {
    console.log("Saving changes:", formData);
    alert("Changes saved successfully!");
  };

  const handleChangePassword = () => {
    alert("Password change functionality will be implemented");
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    alert("Logged out successfully!");
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleMenuClick = (itemId) => {
    setActiveMenuItem(itemId);
  };

  const isEmbedded = embedded || !!frame;

  const frameStyle = frame
    ? {
        width: `${frame.width}px`,
        height: `${frame.height}px`,
        transform: `rotate(${frame.angle}deg)`,
        opacity: frame.opacity,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50" style={frame ? { display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" } : undefined}>
      {/* Header */}
      {!isEmbedded && (
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 h-14 z-50">
          <div className="h-full flex items-center justify-between px-6">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span className="font-semibold text-gray-800">EMEKA</span>
              </div>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-1">
              {/* Notifications */}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* Help */}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition ml-1">
                <div className={`w-7 h-7 ${userRole === "teacher" ? "bg-purple-600" : "bg-blue-600"} rounded-full flex items-center justify-center text-white font-semibold text-xs`}>
                  {userName?.charAt(0).toUpperCase() || "A"}
                </div>
                <span className="font-medium text-gray-900 text-sm">{userName || "User"}</span>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Sidebar */}
      {!isEmbedded && (
        <div className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-52 bg-gradient-to-b from-green-50 via-green-50 to-white border-r border-gray-200 overflow-y-auto">
        {/* Menu Items */}
        <nav className="pt-4 px-3 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
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
          onClick={handleLogoutClick}
          className="absolute bottom-4 left-3 right-3 flex items-center space-x-2.5 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Log Out</span>
        </button>
        </div>
      )}

      {/* Logout Confirmation Modal (only when not embedded) */}
      {!isEmbedded && showLogoutModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          onClick={handleCancelLogout}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-8 pb-4">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 text-center px-6 mb-2">
              Confirm Logout
            </h2>

            <p className="text-gray-600 text-center px-6 mb-6 text-sm">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleCancelLogout}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition text-sm"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isEmbedded ? (
        <div className="ml-52 mt-14 p-6">
          <div className="max-w-4xl mx-auto">
          {/* Profile Header Card */}
          <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-t-2xl p-8 relative" style={{ minHeight: 150 }}>
            {/* avatar positioned absolutely so its center sits on the header bottom divider */}
            <div style={{ position: 'absolute', left: 16, bottom: -48, width: 96, height: 96, borderRadius: '9999px', background: '#ffffff', padding: 4, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
              <img
                src={tProfile}
                alt="Profile"
                width={88}
                height={88}
                style={{ width: 88, height: 88, borderRadius: '9999px', objectFit: 'cover', display: 'block' }}
              />
              <button className="bg-gray-800 rounded-full p-1.5 border-2 border-white hover:bg-gray-700 transition" style={{ position: 'absolute', right: -6, bottom: -6 }}>
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            <div style={{ paddingLeft: 128, display: 'flex', alignItems: 'center', height: '100%' }} className="">
              <div>
                <h1 className="text-2xl font-bold mb-1 text-gray-900">Sarah Johnson</h1>
                <div className="w-20 h-1 bg-emerald-200 rounded mt-2"></div>
                <p className="text-gray-600 text-sm mb-0.5">Teacher • Mathematics Department</p>
                <p className="text-gray-600 text-sm">sarah.johnson@school.edu</p>
              </div>
            </div>
          </div>

          {/* White spacer matching green header height (separates gradient and tabs) */}
          <div className="bg-white" style={{ height: 150 }} />

          {/* Tabs */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-6" style={{ height: 140, display: 'flex', alignItems: 'flex-end' }}>
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-medium transition relative ${
                      activeTab === tab
                        ? "text-gray-900 border-b-2 border-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-b-2xl p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>

            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible" style={{ width: 612.44, height: 200 }}>
                  {/* main container: fixed 803x216 */}
                  <div className="bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3 relative" style={{ height: 128 }}>
                    <div style={{ position: 'absolute', left: 16, bottom: -48, width: 96, height: 96, borderRadius: '9999px', background: '#ffffff', padding: 4, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                      <img
                        src={tProfile}
                        alt="Profile"
                        width={88}
                        height={88}
                        style={{ width: 88, height: 88, borderRadius: '9999px', objectFit: 'cover', display: 'block' }}
                      />
                      <button aria-label="change-avatar" className="bg-gray-800 rounded-full p-2 border-2 border-white hover:bg-gray-700 transition" style={{ position: 'absolute', right: -6, bottom: -6 }}>
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    <div style={{ paddingLeft: 128, display: 'flex', alignItems: 'center', height: '100%' }} className="ml-4">
                      <div>
                        <h1 className="text-lg font-bold mb-1 text-gray-900">Sarah Johnson</h1>
                        <p className="text-gray-600 text-xs mb-0.5">Teacher • Mathematics Department</p>
                        <p className="text-gray-600 text-xs">sarah.johnson@school.edu</p>
                      </div>
                    </div>
                  </div>

                  {/* White spacer under inner gradient to match its height */}
                  <div style={{ height: 128 }} className="bg-white" />
                </div>
              </div>

              {/* Role */}
              <div className="max-w-[calc(50%-12px)]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm"
                />
              </div>

              {/* Change Password Section */}
              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Change Password
                </label>
                <button 
                  onClick={handleChangePassword}
                  className="w-full max-w-xs px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition"
                >
                  Do you want change the password
                </button>
              </div>

              {/* Save Button */}
              <div className="pt-6">
                <button
                  onClick={handleSaveChanges}
                  className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      ) : (
        <div className="p-6" style={frameStyle ? { width: frameStyle.width, height: frameStyle.height, transform: frameStyle.transform, opacity: frameStyle.opacity } : undefined}>
          <div className="max-w-4xl mx-auto" style={frame ? { height: '100%', overflow: 'auto' } : undefined}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* large gradient header area */}
              <div className="relative bg-gradient-to-r from-emerald-400 to-teal-500 rounded-t-2xl" style={{ height: 140 }}>
                    <div className="absolute left-6 top-6 flex items-start gap-4">
                          <div style={{ position: 'relative', width: 96, height: 96, left: 0 }}>
                            <img
                              src={tProfile}
                              alt="Profile"
                              width={88}
                              height={88}
                              style={{ width: 88, height: 88, borderRadius: '9999px', objectFit: 'cover', border: '6px solid rgba(255,255,255,0.95)', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}
                            />
                            <button aria-label="change-avatar" className="bg-gray-800 rounded-full p-2 border-2 border-white hover:bg-gray-700 transition" style={{ position: 'absolute', right: -6, bottom: -6 }}>
                              <Camera className="w-4 h-4 text-white" />
                            </button>
                          </div>
                  <div className="text-white mt-2">
                    <h1 className="text-2xl font-semibold">Sarah Johnson</h1>
                    <div className="w-24 h-1 bg-emerald-600 rounded mt-2"></div>
                    <p className="text-emerald-50 text-sm mt-2">Teacher • Mathematics Department</p>
                    <p className="text-emerald-50 text-sm">sarah.johnson@school.edu</p>
                  </div>
                </div>
              </div>

              {/* Tabs below header */}
              <div className="px-6 pt-4" style={{ height: 140 }}>
                <div className="flex items-center space-x-6 border-b border-gray-100">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 pt-2 text-sm font-medium transition ${
                        activeTab === tab
                          ? "text-emerald-600 border-b-2 border-emerald-600"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Content (unchanged) */}
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm"
                      />
                    </div>
                  </div>

                  <div className="max-w-[calc(50%-12px)]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm"
                    />
                  </div>

                  <div className="pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Change Password
                    </label>
                    <button 
                      onClick={handleChangePassword}
                      className="w-full max-w-xs px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition"
                    >
                      Do you want change the password
                    </button>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={handleSaveChanges}
                      className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherProfile;