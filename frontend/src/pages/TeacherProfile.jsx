import React, { useState, useEffect, useRef } from "react";
import { Camera, Eye, EyeOff } from "lucide-react";
import tProfile from "../assets/t-profile.png";

const TeacherProfile = ({ embedded = false, frame = null }) => {
  const [activeMenuItem, setActiveMenuItem] = useState("profile");
  const [activeTab, setActiveTab] = useState("Account Info");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: ""
  });

  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Load user data from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setFormData((prev) => ({
          ...prev,
          fullName: parsed.fullName || parsed.name || prev.fullName,
          email: parsed.email || prev.email,
          role: parsed.role ? (parsed.role.charAt(0).toUpperCase() + parsed.role.slice(1)) : (parsed.userRole ? (parsed.userRole.charAt(0).toUpperCase() + parsed.userRole.slice(1)) : prev.role),
        }));
        return;
      }

      const storedName = localStorage.getItem("userName") || localStorage.getItem("name");
      const storedEmail = localStorage.getItem("email");
      const storedRole = localStorage.getItem("userRole") || localStorage.getItem("role");
      const capRole = storedRole ? (storedRole.charAt(0).toUpperCase() + storedRole.slice(1)) : storedRole;
      setFormData((prev) => ({
        ...prev,
        fullName: storedName || prev.fullName,
        email: storedEmail || prev.email,
        role: capRole || prev.role,
      }));
    } catch (e) {
      console.warn("Failed to load stored user data:", e);
    }
  }, []);

  // Load avatar from localStorage
  useEffect(() => {
    try {
      const storedAvatar = localStorage.getItem('avatar');
      if (storedAvatar) setAvatarUrl(storedAvatar);
    } catch (e) {
      // ignore
    }
  }, []);

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      setAvatarUrl(dataUrl);
      try {
        localStorage.setItem('avatar', dataUrl);
      } catch (err) {
        // ignore
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePwdData, setChangePwdData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // Settings toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [emotionConsent, setEmotionConsent] = useState(true);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("profileSettings");
      if (raw) {
        const parsed = JSON.parse(raw);
        setEmailNotifications(!!parsed.emailNotifications);
        setSmsNotifications(!!parsed.smsNotifications);
        setInAppNotifications(!!parsed.inAppNotifications);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const userName = formData.fullName ? formData.fullName.split(" ")[0] : "";
  const userRole = (formData.role || "").toLowerCase();
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
    let newValue = value;
    if (name === "role") {
      newValue = value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
    }
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleUpdateProfile = async () => {
    if (!formData.fullName || formData.fullName.trim() === '') {
    alert('Name cannot be empty');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:5000/api/teacher/update-name', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: formData.fullName })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || 'Failed to update profile');
      return;
    }

    // Update localStorage with new name
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      parsed.name = data.data.name;
      parsed.fullName = data.data.name;
      localStorage.setItem('user', JSON.stringify(parsed));
    }

    alert('Changes saved successfully!');
  } catch (error) {
    console.error('Save changes error:', error);
    alert('Failed to save changes. Please try again.');
  }
  }

  const handleSubmitChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = changePwdData;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill all fields.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/teacher/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to change password');
        return;
      }

      alert('Password changed successfully!');
      handleCloseChangePassword();
    } catch (error) {
      console.error('Password change error:', error);
      alert('Failed to change password. Please try again.');
    }
  };

  const handleSaveChanges = () => {
    console.log("Saving changes:", formData);
    alert("Changes saved successfully!");
  };

  const handleSaveSettings = async () => {
    const payload = { emailNotifications, smsNotifications, inAppNotifications };
    try {
      const hostname = typeof window !== 'undefined' && window.location && window.location.hostname ? window.location.hostname : '';
      const isLocal = /localhost|127\.0\.0\.1/.test(hostname);
      if (isLocal) {
        localStorage.setItem('profileSettings', JSON.stringify(payload));
        alert('Saved locally');
        return;
      }

      const data = await putJSON('/users/profile/settings', payload);
      localStorage.setItem('profileSettings', JSON.stringify(payload));
      alert('Settings saved');
    } catch (err) {
      localStorage.setItem('profileSettings', JSON.stringify(payload));
      const msg = err?.message || (err?.body && err.body.message) || 'Server error';
      alert('Saved locally. Server error: ' + msg);
    }
  };

  const handleChangePassword = () => {
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
      {/* Hidden file input for avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        style={{ display: 'none' }}
      />
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
                  {userName ? userName.charAt(0).toUpperCase() : ""}
                </div>
                <span className="font-medium text-gray-900 text-sm">{userName || ""}</span>
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

      {/* Change Password Modal */}
      {showChangePassword && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10000 p-6"
          onClick={handleCloseChangePassword}
        >
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#bdf2d1] rounded-lg shadow-2xl overflow-hidden">
              <div className="relative px-8 pt-6 pb-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                <button
                  onClick={handleCloseChangePassword}
                  className="absolute right-4 top-4 text-gray-700 hover:text-gray-900 p-1 rounded"
                  aria-label="close-modal"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="px-10 pb-8">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={changePwdData.currentPassword}
                    onChange={handleChangePwdInput}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md bg-white shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={changePwdData.newPassword}
                      onChange={handleChangePwdInput}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md bg-white shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={changePwdData.confirmPassword}
                      onChange={handleChangePwdInput}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md bg-white shadow-sm"
                    />
                    {changePwdData.confirmPassword !== '' && changePwdData.newPassword !== changePwdData.confirmPassword && (
                      <p className="text-xs text-red-600 mt-2">Passwords do not match</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSubmitChangePassword}
                    className="flex items-center gap-3 px-4 py-2 rounded-md bg-[#19765A] text-white hover:bg-[#165e4f] shadow"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm">Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isEmbedded ? (
        <div className="mt-4 p-6">
          <div className="w-full mx-auto">
          {/* Profile Header Card */}
          <div className="rounded-t-2xl p-8 relative" style={{ minHeight: 150, background: 'linear-gradient(90deg, #7FEBCB 0%, #19765A 100%)' }}>
            {/* Combined centered block: avatar + text, split 50% across header divider */}
            <div style={{ position: 'absolute', left: 16, bottom: -60, display: 'flex', alignItems: 'center', gap: 16, padding: '8px 12px' }}>
              <div style={{ position: 'relative', width: 96, height: 96, borderRadius: '9999px', padding: 4, background: 'transparent', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                <img
                  src={avatarUrl || tProfile}
                  alt="Profile"
                  style={{ width: 88, height: 88, borderRadius: '9999px', objectFit: 'cover', display: 'block', border: 'none' }}
                />
                <button aria-label="change-avatar" onClick={handleAvatarClick} style={{ position: 'absolute', right: -6, bottom: -6, width: 36, height: 36, borderRadius: '9999px', background: '#1F2937BF', border: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover:opacity-90 transition">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>

              <div style={{ marginLeft: 12 }}>
                <h1 className="text-2xl font-bold mb-1 text-black">{formData.fullName}</h1>
                <div className="w-20 h-1 bg-emerald-200 rounded mt-2"></div>
                <p className="text-sm mb-0.5" style={{ color: 'rgba(0,0,0,0.6)' }}>{formData.role || ''}</p>
                <p className="text-sm" style={{ color: 'rgba(0,0,0,0.6)' }}>{formData.email}</p>
              </div>
            </div>
          </div>

          {/* White spacer matching green header height (separates gradient and tabs) */}
          <div className="bg-white" style={{ height: 48 }} />

          {/* Form Content */}
          <div className="bg-white rounded-b-2xl p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>

            <div className="p-6">
              {activeTab === "Account Info" ? (
                <>
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible flex flex-col justify-between" style={{ width: 612.44, minHeight: 220, position: 'relative' }}>
                      {/* main container: fixed 803x216 */}
                      <div className="bg-linear-to-r from-emerald-400 to-teal-500 px-6 py-3 relative" style={{ height: 88 }}>
                        {/* Combined centered block inside inner account container */}
                        <div style={{ position: 'absolute', left: 16, bottom: -60, display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px' }}>
                          <div style={{ position: 'relative', width: 96, height: 96, borderRadius: '9999px', padding: 4, background: 'transparent', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                            <img
                              src={avatarUrl || tProfile}
                              alt="Profile"
                              style={{ width: 88, height: 88, borderRadius: '9999px', objectFit: 'cover', display: 'block', border: 'none' }}
                            />
                            <button aria-label="change-avatar" onClick={handleAvatarClick} style={{ position: 'absolute', right: -6, bottom: -6, width: 36, height: 36, borderRadius: '9999px', background: '#1F2937BF', border: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover:opacity-90 transition">
                              <Camera className="w-4 h-4 text-white" />
                            </button>
                          </div>

                          <div style={{ marginLeft: 12 }}>
                            <h1 className="text-lg font-bold mb-1 text-black">{formData.fullName}</h1>
                            <p className="text-xs mb-0.5" style={{ color: 'rgba(0,0,0,0.6)' }}>{formData.role || ''}</p>
                            <p className="text-xs" style={{ color: 'rgba(0,0,0,0.6)' }}>{formData.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Replace fixed spacer + absolute tabs with flex-based footer */}
                      <div className="flex-1 flex items-end">
                        <div className="w-full px-4" style={{ paddingBottom: 50 }}>
                          <div className="flex justify-start gap-16">
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
                      onClick={handleUpdateProfile}
                      className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Save Changes
                    </button>
                  </div>
                </>
              ) : activeTab === "Settings" ? (
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>

                  <div className="flex-1 flex flex-col justify-between gap-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setEmailNotifications((s) => !s)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${emailNotifications ? 'bg-green-600' : 'bg-gray-400'}`}
                          aria-pressed={emailNotifications}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications via text message</p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setSmsNotifications((s) => !s)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${smsNotifications ? 'bg-green-600' : 'bg-gray-400'}`}
                          aria-pressed={smsNotifications}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${smsNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">In-App Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications in the application</p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setInAppNotifications((s) => !s)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${inAppNotifications ? 'bg-green-600' : 'bg-gray-500'}`}
                          aria-pressed={inAppNotifications}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${inAppNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-md bg-[#19765A] text-white hover:bg-[#165e4f] shadow"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span className="text-sm">Save Changes</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : activeTab === "Activity" ? (
                <div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

                    <div className="space-y-3">
                      {[{
                        title: 'Algebra Fundamentals', date: 'May 15, 2023', duration: '01 Hour', status: 'Average', statusColor: 'bg-blue-100 text-blue-700'
                      },{
                        title: 'Geometry Basics', date: 'May 12, 2023', duration: '01 Hour', status: 'Good', statusColor: 'bg-green-100 text-green-700'
                      },{
                        title: 'Calculus Introduction', date: 'May 10, 2023', duration: '02 Hours', status: 'Weak', statusColor: 'bg-yellow-100 text-yellow-700'
                      },{
                        title: 'Statistics Fundamentals', date: 'May 5, 2023', duration: '01 Hour', status: 'Average', statusColor: 'bg-blue-100 text-blue-700'
                      },{
                        title: 'Probability Theory', date: 'May 3, 2023', duration: '02 Hours', status: 'Good', statusColor: 'bg-green-100 text-green-700'
                      }].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-gray-50 hover:shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-50 rounded flex items-center justify-center text-emerald-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" /></svg>
                            </div>
                            <div>
                              <a href="#" className="font-medium text-gray-800 hover:underline">{item.title}</a>
                              <div className="text-xs text-gray-500">{item.date} • {item.duration}</div>
                            </div>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${item.statusColor}`}>{item.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6 items-start">
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col" style={{ minHeight: 550 }}>
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-base font-semibold text-gray-800">Class Average</h4>
                          <div className="text-sm bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">87.2%</div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          {[{label:'Algebra Fundamentals', pct:85,color:'bg-blue-500'},{label:'Geometry Basics', pct:92,color:'bg-green-500'},{label:'Calculus Introduction', pct:78,color:'bg-yellow-400'},{label:'Statistics Fundamentals', pct:88,color:'bg-blue-500'},{label:'Probability Theory', pct:95,color:'bg-emerald-500'}].map((c,i)=> (
                            <div key={i} className="flex flex-col">
                              <div className="flex items-center justify-between text-sm text-gray-700">
                                <span className="truncate">{c.label}</span>
                                <span className="font-semibold text-sm">{c.pct}%</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-3 mt-2">
                                <div className={`h-3 rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col" style={{ minHeight: 550 }}>
                        <h4 className="text-base font-semibold text-gray-800">Top Performing Students</h4>
                        <div className="mt-4 flex-1 flex flex-col justify-between divide-y divide-gray-100 overflow-hidden">
                          {[{name:'Alex Johnson', score:'97%'},{name:'Jamie Smith', score:'95%'},{name:'Taylor Brown', score:'93%'}].map((s,i)=>(
                            <div key={i} className="flex items-center gap-6 py-4 cursor-pointer hover:bg-gray-50 rounded-md px-3">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-lg">{s.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                              <div className="flex-1">
                                <div className="text-base font-semibold text-gray-900">{s.name}</div>
                                <div className="text-sm text-gray-500 mt-1">{s.score} across 5 subjects</div>
                              </div>
                              <div className="text-base text-gray-600 font-semibold">{s.score}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between" style={{ minHeight: 550 }}>
                        <h4 className="text-base font-semibold text-gray-800">Recent Submissions</h4>
                        <div className="mt-4 flex-1 flex flex-col justify-between divide-y divide-gray-100 text-sm text-gray-700 overflow-hidden">
                          {[{student:'Casey Williams', item:'Calculus Quiz 3', date:'May 16, 2023', score:'88', color:'text-blue-600'},{student:'Jordan Lee', item:'Statistics Homework', date:'May 15, 2023', score:'92', color:'text-green-600'},{student:'Riley Garcia', item:'Algebra Test', date:'May 15, 2023', score:'78', color:'text-yellow-500'}].map((r,i)=>(
                            <div key={i} className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 rounded-md px-3">
                              <div>
                                <div className="font-semibold text-base">{r.student}</div>
                                <div className="text-sm text-gray-500">{r.item} • {r.date}</div>
                              </div>
                              <div className={`text-lg font-semibold ${r.color}`}>{r.score}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                </div>
                ) : (
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold mb-4">Privacy & Data</h3>

                    <div className="flex flex-col gap-8">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Emotion Data Consent</h4>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Allow the application to collect and analyze emotional data during quiz sessions to improve teaching experience.</p>
                          <a href="#" className="text-sm text-emerald-600 font-medium mt-3 inline-block">Read our privacy policy</a>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => setEmotionConsent((v) => !v)}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${emotionConsent ? 'bg-emerald-600' : 'bg-gray-300'}`}
                            aria-pressed={emotionConsent}
                          >
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${emotionConsent ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Export Your Data</h4>
                      <p className="text-sm text-gray-500 mt-2">Download a copy of your personal data and activity history.</p>

                      <div className="mt-6 flex flex-col items-start gap-4">
                        <button className="inline-flex items-center gap-3 px-4 py-2 rounded-md bg-[#19765A] text-white hover:bg-[#165e4f] shadow">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v13m0 0l-4-4m4 4l4-4M21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6"/></svg>
                          <span className="text-sm">Export All Data</span>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const hostname = typeof window !== 'undefined' && window.location && window.location.hostname ? window.location.hostname : '';
                              const isLocal = /localhost|127\.0\.0\.1/.test(hostname);
                              const payload = { emotionConsent };
                              if (isLocal) {
                                localStorage.setItem('privacySettings', JSON.stringify(payload));
                                alert('Privacy settings saved locally');
                                return;
                              }
                              localStorage.setItem('privacySettings', JSON.stringify(payload));
                              alert('Privacy settings saved');
                            } catch (err) {
                              localStorage.setItem('privacySettings', JSON.stringify({ emotionConsent }));
                              alert('Saved locally. Server error.');
                            }
                          }}
                          className="inline-flex items-center gap-3 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                          <span>Save Privacy Settings</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      ) : (
        <div className="p-6" style={frameStyle ? { width: frameStyle.width, height: frameStyle.height, transform: frameStyle.transform, opacity: frameStyle.opacity } : undefined}>
          <div className="max-w-4xl mx-auto" style={frame ? { height: '100%', overflow: 'auto' } : undefined}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* large gradient header area */}
              <div className="relative bg-linear-to-r from-emerald-400 to-teal-500 rounded-t-2xl" style={{ height: 120 }}>
                    {/* Combined centered block for embedded/frame header (text stays white here) */}
                    <div style={{ position: 'absolute', left: 16, bottom: -60, display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px' }}>
                          <div style={{ position: 'relative', width: 96, height: 96, borderRadius: '9999px', padding: 4, background: 'transparent' }}>
                            <img
                              src={avatarUrl || tProfile}
                              alt="Profile"
                              style={{ width: 88, height: 88, borderRadius: '9999px', objectFit: 'cover', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', border: 'none' }}
                            />
                            <button aria-label="change-avatar" onClick={handleAvatarClick} style={{ position: 'absolute', right: -6, bottom: -6, width: 36, height: 36, borderRadius: '9999px', background: '#1F2937BF', border: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover:opacity-90 transition">
                              <Camera className="w-4 h-4 text-white" />
                            </button>
                          </div>
                  <div className="text-white mt-2" style={{ marginLeft: 20 }}>
                    <h1 className="text-2xl font-semibold text-black">{formData.fullName}</h1>
                    <p className="text-sm mt-2" style={{ color: 'rgba(0,0,0,0.6)' }}>{formData.role || ''}</p>
                    <p className="text-sm" style={{ color: 'rgba(0,0,0,0.6)' }}>{formData.email}</p>
                  </div>
                </div>
              </div>

              {/* Tabs below header */}
              <div className="px-6 pt-25" style={{ height: 88, paddingBottom: 50 }}>
                <div className="flex items-center space-x-16 border-b border-gray-100">
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

              {/* Form Content: render according to active tab */}
              <div className="p-6" style={{ minHeight: 220 }}>
                {activeTab === "Account Info" ? (
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
                        <button type="button" disabled aria-disabled="true" className="w-full text-left px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 cursor-not-allowed">
                          {formData.email}
                        </button>
                      </div>
                    </div>

                    <div className="max-w-[calc(50%-12px)]">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <button type="button" disabled aria-disabled="true" className="w-full text-left px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 cursor-not-allowed">
                        {formData.role}
                      </button>
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
                        onClick={handleUpdateProfile}
                        className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : activeTab === "Settings" ? (
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>

                  <div className="flex-1 flex flex-col justify-between gap-8">
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setEmailNotifications((s) => !s)}
                          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${emailNotifications ? 'bg-green-600' : 'bg-gray-400'}`}
                          aria-pressed={emailNotifications}
                        >
                          <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications via text message</p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setSmsNotifications((s) => !s)}
                          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${smsNotifications ? 'bg-green-600' : 'bg-gray-400'}`}
                          aria-pressed={smsNotifications}
                        >
                          <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${smsNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium">In-App Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications in the application</p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setInAppNotifications((s) => !s)}
                          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${inAppNotifications ? 'bg-green-600' : 'bg-gray-400'}`}
                          aria-pressed={inAppNotifications}
                        >
                          <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${inAppNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        className="inline-flex items-center gap-3 px-5 py-3 rounded-md bg-[#19765A] text-white hover:bg-[#165e4f] shadow"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span className="text-sm">Save Changes</span>
                      </button>
                    </div>
                  </div>
                  </div>
                ) : activeTab === "Activity" ? (
                  <div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

                      <div className="space-y-3">
                        {[{
                          title: 'Algebra Fundamentals', date: 'May 15, 2023', duration: '01 Hour', status: 'Average', statusColor: 'bg-blue-100 text-blue-700'
                        },{
                          title: 'Geometry Basics', date: 'May 12, 2023', duration: '01 Hour', status: 'Good', statusColor: 'bg-green-100 text-green-700'
                        },{
                          title: 'Calculus Introduction', date: 'May 10, 2023', duration: '02 Hours', status: 'Weak', statusColor: 'bg-yellow-100 text-yellow-700'
                        },{
                          title: 'Statistics Fundamentals', date: 'May 5, 2023', duration: '01 Hour', status: 'Average', statusColor: 'bg-blue-100 text-blue-700'
                        },{
                          title: 'Probability Theory', date: 'May 3, 2023', duration: '02 Hours', status: 'Good', statusColor: 'bg-green-100 text-green-700'
                        }].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-gray-50 hover:shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-emerald-50 rounded flex items-center justify-center text-emerald-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" /></svg>
                              </div>
                              <div>
                                <a href="#" className="font-medium text-gray-800 hover:underline">{item.title}</a>
                                <div className="text-xs text-gray-500">{item.date} • {item.duration}</div>
                              </div>
                            </div>
                            <div>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${item.statusColor}`}>{item.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6 items-start">
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col" style={{ minHeight: 550 }}>
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-base font-semibold text-gray-800">Class Average</h4>
                          <div className="text-sm bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">87.2%</div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          {[{label:'Algebra Fundamentals', pct:85,color:'bg-blue-500'},{label:'Geometry Basics', pct:92,color:'bg-green-500'},{label:'Calculus Introduction', pct:78,color:'bg-yellow-400'},{label:'Statistics Fundamentals', pct:88,color:'bg-blue-500'},{label:'Probability Theory', pct:95,color:'bg-emerald-500'}].map((c,i)=> (
                            <div key={i} className="flex flex-col">
                              <div className="flex items-center justify-between text-sm text-gray-700">
                                <span className="truncate">{c.label}</span>
                                <span className="font-semibold text-sm">{c.pct}%</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-3 mt-2">
                                <div className={`h-3 rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col" style={{ minHeight: 550 }}>
                        <h4 className="text-base font-semibold text-gray-800">Top Performing Students</h4>
                        <div className="mt-4 flex-1 flex flex-col justify-between divide-y divide-gray-100 overflow-hidden">
                          {[{name:'Alex Johnson', score:'97%'},{name:'Jamie Smith', score:'95%'},{name:'Taylor Brown', score:'93%'}].map((s,i)=>(
                            <div key={i} className="flex items-center gap-6 py-4 cursor-pointer hover:bg-gray-50 rounded-md px-3">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-lg">{s.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                              <div className="flex-1">
                                <div className="text-base font-semibold text-gray-900">{s.name}</div>
                                <div className="text-sm text-gray-500 mt-1">{s.score} across 5 subjects</div>
                              </div>
                              <div className="text-base text-gray-600 font-semibold">{s.score}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between" style={{ minHeight: 550 }}>
                        <h4 className="text-base font-semibold text-gray-800">Recent Submissions</h4>
                        <div className="mt-4 flex-1 flex flex-col justify-between divide-y divide-gray-100 text-sm text-gray-700 overflow-hidden">
                          {[{student:'Casey Williams', item:'Calculus Quiz 3', date:'May 16, 2023', score:'88', color:'text-blue-600'},{student:'Jordan Lee', item:'Statistics Homework', date:'May 15, 2023', score:'92', color:'text-green-600'},{student:'Riley Garcia', item:'Algebra Test', date:'May 15, 2023', score:'78', color:'text-yellow-500'}].map((r,i)=>(
                            <div key={i} className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 rounded-md px-3">
                              <div>
                                <div className="font-semibold text-base">{r.student}</div>
                                <div className="text-sm text-gray-500">{r.item} • {r.date}</div>
                              </div>
                              <div className={`text-lg font-semibold ${r.color}`}>{r.score}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold mb-4">Privacy & Data</h3>

                      <div className="flex flex-col gap-8">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Emotion Data Consent</h4>
                          <div className="mt-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">Allow the application to collect and analyze emotional data during quiz sessions to improve teaching experience.</p>
                              <a href="#" className="text-sm text-emerald-600 font-medium mt-3 inline-block">Read our privacy policy</a>
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => setEmotionConsent((v) => !v)}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${emotionConsent ? 'bg-emerald-600' : 'bg-gray-300'}`}
                                aria-pressed={emotionConsent}
                              >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${emotionConsent ? 'translate-x-5' : 'translate-x-0'}`} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Export Your Data</h4>
                          <p className="text-sm text-gray-500 mt-2">Download a copy of your personal data and activity history.</p>

                          <div className="mt-6 flex flex-col items-start gap-4">
                            <button className="inline-flex items-center gap-3 px-4 py-2 rounded-md bg-[#19765A] text-white hover:bg-[#165e4f] shadow">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v13m0 0l-4-4m4 4l4-4M21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6"/></svg>
                              <span className="text-sm">Export All Data</span>
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const hostname = typeof window !== 'undefined' && window.location && window.location.hostname ? window.location.hostname : '';
                                  const isLocal = /localhost|127\.0\.0\.1/.test(hostname);
                                  const payload = { emotionConsent };
                                  if (isLocal) {
                                    localStorage.setItem('privacySettings', JSON.stringify(payload));
                                    alert('Privacy settings saved locally');
                                    return;
                                  }
                                  localStorage.setItem('privacySettings', JSON.stringify(payload));
                                  alert('Privacy settings saved');
                                } catch (err) {
                                  localStorage.setItem('privacySettings', JSON.stringify({ emotionConsent }));
                                  alert('Saved locally. Server error.');
                                }
                              }}
                              className="inline-flex items-center gap-3 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                              <span>Save Privacy Settings</span>
                            </button>
                          </div>
                        </div>
                      </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherProfile;