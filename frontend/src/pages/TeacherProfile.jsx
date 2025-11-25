import React, { useState } from "react";
import { Camera, Eye, EyeOff } from "lucide-react";
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

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePwdData, setChangePwdData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

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
    console.log('open change password modal');
    setShowChangePassword(true);
  };

  const handleChangePwdInput = (e) => {
    const { name, value } = e.target;
    setChangePwdData((p) => ({ ...p, [name]: value }));
  };

  const handleCloseChangePassword = () => {
    setShowChangePassword(false);
    setChangePwdData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleSubmitChangePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = changePwdData;
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }
    // Frontend-only: simulate success
    alert('Password changed successfully (frontend only)');
    handleCloseChangePassword();
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
        <div className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-52 bg-[#bdf2d1] border-r border-gray-200 overflow-y-auto">
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-9999 p-4"
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

      {/* Change Password Modal (frontend-only) */}
      {showChangePassword && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-10000 p-6"
          onClick={handleCloseChangePassword}
        >
          <div className="w-full max-w-3xl mt-16" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#bdf2d1] border border-gray-200 rounded-md shadow-2xl overflow-hidden">
              <div className="relative px-8 pt-5 pb-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                <button
                  onClick={handleCloseChangePassword}
                  className="absolute right-4 top-3 text-gray-700 hover:text-gray-900 p-1 rounded"
                  aria-label="close-modal"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="px-10 pb-8">
                <div className="bg-transparent">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPwd.current ? "text" : "password"}
                        name="currentPassword"
                        value={changePwdData.currentPassword}
                        onChange={handleChangePwdInput}
                        className="w-full pr-10 px-4 py-3 border border-gray-200 rounded-md bg-white shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((p) => ({ ...p, current: !p.current }))}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                        aria-label="toggle-current-password"
                      >
                        {showPwd.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showPwd.new ? "text" : "password"}
                          name="newPassword"
                          value={changePwdData.newPassword}
                          onChange={handleChangePwdInput}
                          className="w-full pr-10 px-4 py-3 border border-gray-200 rounded-md bg-white shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd((p) => ({ ...p, new: !p.new }))}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                          aria-label="toggle-new-password"
                        >
                          {showPwd.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showPwd.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={changePwdData.confirmPassword}
                          onChange={handleChangePwdInput}
                          className="w-full pr-10 px-4 py-3 border border-gray-200 rounded-md bg-white shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd((p) => ({ ...p, confirm: !p.confirm }))}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                          aria-label="toggle-confirm-password"
                        >
                          {showPwd.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {changePwdData.confirmPassword !== '' && changePwdData.newPassword !== changePwdData.confirmPassword && (
                        <p className="text-xs text-red-600 mt-2">Passwords do not match</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <button
                      onClick={handleSubmitChangePassword}
                      className="flex items-center gap-3 px-4 py-2 rounded-md bg-[#19765A] text-white hover:bg-[#165e4f] shadow"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-sm">Save Changes</span>
                    </button>

                    <div className="flex-1" />

                    <button onClick={handleCloseChangePassword} className="px-4 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-sm">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isEmbedded ? (
        <div className="ml-52 mt-14 p-6">
          <div className="max-w-4xl mx-auto">
          {/* Profile Header Card */}
          <div className="rounded-t-2xl p-8 relative" style={{ minHeight: 150, background: 'linear-gradient(90deg, #7FEBCB 0%, #19765A 100%)' }}>
            {/* Combined centered block: avatar + text, split 50% across header divider */}
            <div style={{ position: 'absolute', left: 16, bottom: -60, display: 'flex', alignItems: 'center', gap: 16, padding: '8px 12px' }}>
              <div style={{ position: 'relative', width: 96, height: 96, borderRadius: '9999px', padding: 4, background: 'transparent', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                <img
                  src={tProfile}
                  alt="Profile"
                  style={{ width: 88, height: 88, borderRadius: '9999px', objectFit: 'cover', display: 'block', border: 'none' }}
                />
                <button aria-label="change-avatar" style={{ position: 'absolute', right: -6, bottom: -6, width: 36, height: 36, borderRadius: '9999px', background: '#1F2937BF', border: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover:opacity-90 transition">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>

              <div style={{ marginLeft: 12 }}>
                <h1 className="text-2xl font-bold mb-1 text-black">Sarah Johnson</h1>
                <div className="w-20 h-1 bg-emerald-200 rounded mt-2"></div>
                <p className="text-sm mb-0.5" style={{ color: 'rgba(0,0,0,0.6)' }}>Teacher • Mathematics Department</p>
                <p className="text-sm" style={{ color: 'rgba(0,0,0,0.6)' }}>sarah.johnson@school.edu</p>
              </div>
            </div>
          </div>

          {/* White spacer matching green header height (separates gradient and tabs) */}
          <div className="bg-white" style={{ height: 150 }} />

          {/* Form Content */}
          <div className="bg-white rounded-b-2xl p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>

            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible" style={{ width: 612.44, height: 200, position: 'relative' }}>
                  {/* main container: fixed 803x216 */}
                  <div className="bg-linear-to-r from-emerald-400 to-teal-500 px-6 py-3 relative" style={{ height: 128 }}>
                    {/* Combined centered block inside inner account container */}
                    <div style={{ position: 'absolute', left: 16, bottom: -60, display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px' }}>
                      <div style={{ position: 'relative', width: 96, height: 96, borderRadius: '9999px', padding: 4, background: 'transparent', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                        <img
                          src={tProfile}
                          alt="Profile"
                          style={{ width: 88, height: 88, borderRadius: '9999px', objectFit: 'cover', display: 'block', border: 'none' }}
                        />
                        <button aria-label="change-avatar" style={{ position: 'absolute', right: -6, bottom: -6, width: 36, height: 36, borderRadius: '9999px', background: '#1F2937BF', border: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover:opacity-90 transition">
                          <Camera className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      <div style={{ marginLeft: 12 }}>
                        <h1 className="text-lg font-bold mb-1 text-black">Sarah Johnson</h1>
                        <p className="text-xs mb-0.5" style={{ color: 'rgba(0,0,0,0.6)' }}>Teacher • Mathematics Department</p>
                        <p className="text-xs" style={{ color: 'rgba(0,0,0,0.6)' }}>sarah.johnson@school.edu</p>
                      </div>
                    </div>
                  </div>

                  {/* White spacer under inner gradient to match its height */}
                  <div style={{ height: 128 }} className="bg-white" />

                  {/* Tabs inside the inner account container, anchored to its bottom */}
                  <div style={{ position: 'absolute', left: 16, right: 16, bottom: 12, display: 'flex', justifyContent: 'flex-start' }}>
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium transition relative ${
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
                  type="button"
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
              <div className="relative bg-linear-to-r from-emerald-400 to-teal-500 rounded-t-2xl" style={{ height: 140 }}>
                    {/* Combined centered block for embedded/frame header (text stays white here) */}
                    <div style={{ position: 'absolute', left: 16, bottom: -60, display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px' }}>
                          <div style={{ position: 'relative', width: 96, height: 96, borderRadius: '9999px', padding: 4, background: 'transparent' }}>
                            <img
                              src={tProfile}
                              alt="Profile"
                              style={{ width: 88, height: 88, borderRadius: '9999px', objectFit: 'cover', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', border: 'none' }}
                            />
                            <button aria-label="change-avatar" style={{ position: 'absolute', right: -6, bottom: -6, width: 36, height: 36, borderRadius: '9999px', background: '#1F2937BF', border: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover:opacity-90 transition">
                              <Camera className="w-4 h-4 text-white" />
                            </button>
                          </div>
                  <div className="text-white mt-2" style={{ marginLeft: 20 }}>
                    <h1 className="text-2xl font-semibold text-black">Sarah Johnson</h1>
                    <p className="text-sm mt-2" style={{ color: 'rgba(0,0,0,0.6)' }}>Teacher • Mathematics Department</p>
                    <p className="text-sm" style={{ color: 'rgba(0,0,0,0.6)' }}>sarah.johnson@school.edu</p>
                  </div>
                </div>
              </div>

              {/* Tabs below header */}
              <div className="px-6 pt-25" style={{ height: 140 }}>
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
                      type="button"
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