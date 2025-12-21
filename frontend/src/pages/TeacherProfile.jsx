import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { Camera, Eye, EyeOff } from "lucide-react";
import Header from "../components/headerorigin";
import tProfile from "../assets/t-profile.png";
import jsPDF from "jspdf";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000';

const TeacherProfile = ({ embedded = false, frame = null }) => {
  const [activeMenuItem, setActiveMenuItem] = useState("profile");
  const [activeTab, setActiveTab] = useState("Account Info");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: ""
  });

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  // Settings toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [emotionConsent, setEmotionConsent] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);

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

  // Load avatar from localStorage (teacher-specific key)
  useEffect(() => {
    try {
      const storedAvatar = localStorage.getItem('teacherProfileImage');
      if (storedAvatar) setAvatarUrl(storedAvatar);
    } catch (e) {
      // ignore
    }
  }, []);

  // Fetch teacher profile from server and sync profileImage from Cloudinary + Settings
  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Use relative URL for multi-device compatibility
        const response = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data?.profileImage) {
          // Cloudinary URL is already a full HTTPS URL
          const cloudinaryUrl = response.data.profileImage;
          setAvatarUrl(cloudinaryUrl);
          
          // Update localStorage with Cloudinary URL
          localStorage.setItem('teacherProfileImage', cloudinaryUrl);
          
          console.log('✅ Loaded profile image from Cloudinary:', cloudinaryUrl);
        }

        // 🆕 Sync settings from server - FIXED
        if (response.data?.data?.settings) {
          const serverSettings = response.data.data.settings;
          console.log('✅ Loaded settings from server:', serverSettings);
          
          setEmailNotifications(serverSettings.emailNotifications ?? true);
          setSmsNotifications(serverSettings.smsNotifications ?? false);
          setInAppNotifications(serverSettings.inAppNotifications ?? true);
          setEmotionConsent(serverSettings.emotionConsent ?? true);
          
          // Update localStorage
          localStorage.setItem('profileSettings', JSON.stringify(serverSettings));
        } else {
          // If no settings in response, fetch them separately
          const settingsResponse = await axios.get('/api/teacher/settings', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (settingsResponse.data?.success && settingsResponse.data?.data) {
            const serverSettings = settingsResponse.data.data;
            console.log('✅ Loaded settings from /settings endpoint:', serverSettings);
            
            setEmailNotifications(serverSettings.emailNotifications ?? true);
            setSmsNotifications(serverSettings.smsNotifications ?? false);
            setInAppNotifications(serverSettings.inAppNotifications ?? true);
            setEmotionConsent(serverSettings.emotionConsent ?? true);
            
            localStorage.setItem('profileSettings', JSON.stringify(serverSettings));
          }
        }
      } catch (err) {
        console.warn('Failed to fetch teacher profile:', err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, []);


  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      e.target.value = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      e.target.value = '';
      return;
    }

    // Optimistically show preview using FileReader
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      setAvatarUrl(dataUrl);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary via backend
    const upload = async () => {
      try {
        const formData = new FormData();
        formData.append('profile', file);
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        
        const res = await axios.post('/api/teacher/upload-profile', formData, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            'Content-Type': 'multipart/form-data'
          }
        });
         
        const cloudinaryUrl = res.data?.profileImage;
        if (cloudinaryUrl) {
          setAvatarUrl(cloudinaryUrl);
          localStorage.setItem('teacherProfileImage', cloudinaryUrl);
          window.dispatchEvent(new CustomEvent('teacherProfileImageChanged', { detail: cloudinaryUrl }));
          
          alert('Profile picture updated successfully!');
          
          try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/users/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data?.profileImage) {
              setAvatarUrl(response.data.profileImage);
              localStorage.setItem('teacherProfileImage', response.data.profileImage);
            }
          } catch (refetchErr) {
            console.warn('Refetch failed:', refetchErr.message);
          }
        }
      } catch (err) {
        console.error('Upload failed:', err?.response?.data || err.message);
        alert('Failed to upload profile picture. Please try again.');
        const storedImage = localStorage.getItem('teacherProfileImage');
        if (storedImage) {
          setAvatarUrl(storedImage);
        }
      }
    };

    upload();
    e.target.value = '';
  };

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePwdData, setChangePwdData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  const userName = displayName || formData.fullName ? (displayName || formData.fullName).split(" ")[0] : "";
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

    if (name === "fullName" && newValue.trim()) {
      setDisplayName(newValue);
      localStorage.setItem('userName', newValue);
      const event = new CustomEvent('userNameChanged', { detail: newValue });
      window.dispatchEvent(event);
      console.log('✅ Name change dispatched:', newValue);
    }
  };

  const handleUpdateProfile = async () => {
    if (!formData.fullName || formData.fullName.trim() === '') {
      alert('Name cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/teacher/update-name', {
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

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.name = data.data.name;
        parsed.fullName = data.data.name;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
      
      localStorage.setItem('userName', formData.fullName);
      window.dispatchEvent(new CustomEvent('userNameChanged', { detail: formData.fullName }));

      if (avatarUrl) {
        window.dispatchEvent(new CustomEvent('teacherProfileImageChanged', { detail: avatarUrl }));
        console.log('✅ Teacher profile updated with Cloudinary image:', avatarUrl);
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
      
      const response = await fetch('/api/teacher/change-password', {
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

  // 🆕 FIXED: Save settings to server AND localStorage
  const handleSaveSettings = async () => {
    const payload = { 
      emailNotifications, 
      smsNotifications, 
      inAppNotifications 
    };
    
    setSettingsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put('/api/teacher/settings', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data?.success) {
        // Update localStorage after successful server save
        localStorage.setItem('profileSettings', JSON.stringify(payload));
        console.log('✅ Settings saved to server and localStorage:', payload);
        alert('Settings saved successfully!');
      }
    } catch (err) {
      console.error('❌ Failed to save settings:', err?.response?.data || err.message);
      
      // Fallback to localStorage if server fails
      localStorage.setItem('profileSettings', JSON.stringify(payload));
      alert('Saved locally. Server error: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSettingsLoading(false);
    }
  };

  // 🆕 FIXED: Combined save function for all settings
  const handleSavePrivacySettings = async () => {
    // Save ALL settings including emotionConsent
    const payload = { 
      emailNotifications,
      smsNotifications,
      inAppNotifications,
      emotionConsent 
    };
    
    setSettingsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put('/api/teacher/settings', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data?.success) {
        // Update localStorage with complete settings
        localStorage.setItem('profileSettings', JSON.stringify(payload));
        console.log('✅ All settings saved to server and localStorage:', payload);
        alert('Privacy settings saved successfully!');
      }
    } catch (err) {
      console.error('❌ Failed to save privacy settings:', err?.response?.data || err.message);
      
      localStorage.setItem('profileSettings', JSON.stringify(payload));
      alert('Saved locally. Server error: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSettingsLoading(false);
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

  const handleExportData = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      doc.setFillColor(189, 242, 209);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setFontSize(22);
      doc.setTextColor(0, 0, 0);
      doc.text('Personal Data Export', pageWidth / 2, 25, { align: 'center' });
      
      yPosition = 50;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const exportDate = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Export Date: ${exportDate}`, 20, yPosition);
      yPosition += 15;

      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPosition, pageWidth - 30, 10, 'F');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Profile Information', 20, yPosition + 7);
      yPosition += 18;

      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(`Full Name: ${formData.fullName || 'Not provided'}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Email: ${formData.email || 'Not provided'}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Role: ${formData.role || 'Not provided'}`, 20, yPosition);
      yPosition += 15;

      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPosition, pageWidth - 30, 10, 'F');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Notification Settings', 20, yPosition + 7);
      yPosition += 18;

      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(`Email Notifications: ${emailNotifications ? 'Enabled' : 'Disabled'}`, 20, yPosition);
      yPosition += 8;
      doc.text(`SMS Notifications: ${smsNotifications ? 'Enabled' : 'Disabled'}`, 20, yPosition);
      yPosition += 8;
      doc.text(`In-App Notifications: ${inAppNotifications ? 'Enabled' : 'Disabled'}`, 20, yPosition);
      yPosition += 15;

      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPosition, pageWidth - 30, 10, 'F');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Privacy Settings', 20, yPosition + 7);
      yPosition += 18;

      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(`Emotion Detection Consent: ${emotionConsent ? 'Granted' : 'Not Granted'}`, 20, yPosition);
      yPosition += 15;

      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPosition, pageWidth - 30, 10, 'F');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Activity History', 20, yPosition + 7);
      yPosition += 18;

      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text('Account Created: ' + (formData.createdAt || 'Information not available'), 20, yPosition);
      yPosition += 8;
      doc.text('Last Profile Update: ' + new Date().toLocaleDateString(), 20, yPosition);
      yPosition += 8;
      doc.text('Total Logins: Information not available', 20, yPosition);
      yPosition += 8;
      doc.text('Last Login: ' + new Date().toLocaleString(), 20, yPosition);

      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('This document contains your personal data as stored in our system.', pageWidth / 2, pageHeight - 15, { align: 'center' });
      doc.text('Generated by Emexa Platform', pageWidth / 2, pageHeight - 10, { align: 'center' });

      const fileName = `personal-data-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Generate PDF blob and create URL
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Also download the file
      doc.save(fileName);
      
      // Store PDF URL in localStorage for notification access
      localStorage.setItem('lastExportedPdfUrl', pdfUrl);
      localStorage.setItem('lastExportedPdfName', fileName);
      
      // Create notification for the export
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          `${API_BASE}/api/notifications/data-export`,
          { fileName, pdfUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }
      
      alert('Your data has been exported successfully as a PDF!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-24"></div>
            <div className="p-6 -mt-12 relative z-10">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 bg-gray-300 rounded-full animate-pulse border-4 border-white shadow-lg"></div>
                <div className="flex-1 pb-2">
                  <div className="h-6 bg-gray-300 rounded w-48 animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-gray-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={frame ? { display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" } : undefined}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        style={{ display: 'none' }}
      />
      {!isEmbedded && <Header userName={formData.fullName || displayName} userRole="teacher" />}

      {!isEmbedded && (
        <div className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-52 bg-[#bdf2d1] border-r border-gray-200 overflow-y-auto">
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

      {showChangePassword && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10000 p-6"
          onClick={handleCloseChangePassword}
        >
          <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-lg shadow-2xl overflow-hidden" style={{ backgroundColor: '#BDF2D1' }}>
              <div className="relative px-8 pt-6 pb-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
                <button
                  onClick={handleCloseChangePassword}
                  className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 p-1 rounded"
                  aria-label="close-modal"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="px-8 py-6">
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      placeholder="Enter current password"
                      value={changePwdData.currentPassword}
                      onChange={handleChangePwdInput}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        placeholder="Enter new password"
                        value={changePwdData.newPassword}
                        onChange={handleChangePwdInput}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        value={changePwdData.confirmPassword}
                        onChange={handleChangePwdInput}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSubmitChangePassword}
                    className="px-6 py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition font-medium text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCloseChangePassword}
                    className="px-6 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isEmbedded ? (
        <div className="mt-16 p-6">
          <div className="w-full mx-auto">
          <div className="rounded-t-2xl p-8 relative" style={{ minHeight: 150, background: 'linear-gradient(90deg, #7FEBCB 0%, #19765A 100%)' }}>
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

          <div className="bg-white" style={{ height: 48 }} />

          <div className="bg-white rounded-b-2xl p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>

            <div className="p-6">
              {activeTab === "Account Info" ? (
                <>
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible flex flex-col justify-between" style={{ width: 612.44, minHeight: 220, position: 'relative' }}>
                      <div className="bg-linear-to-r from-emerald-400 to-teal-500 px-6 py-3 relative" style={{ height: 88 }}>
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
                        disabled={settingsLoading}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-md bg-[#19765A] text-white hover:bg-[#165e4f] shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {settingsLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm">Saving...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span className="text-sm">Save Changes</span>
                          </>
                        )}
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
                        <button 
                          onClick={handleExportData}
                          className="inline-flex items-center gap-3 px-4 py-2 rounded-md bg-[#19765A] text-white hover:bg-[#165e4f] shadow"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v13m0 0l-4-4m4 4l4-4M21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6"/></svg>
                          <span className="text-sm">Export All Data</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSavePrivacySettings}
                          disabled={settingsLoading}
                          className="inline-flex items-center gap-3 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {settingsLoading ? (
                            <>
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                              <span>Save Privacy Settings</span>
                            </>
                          )}
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
            {/* Embedded view - similar structure but more compact */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative bg-linear-to-r from-emerald-400 to-teal-500 rounded-t-2xl" style={{ height: 120 }}>
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

              <div className="p-6" style={{ minHeight: 220 }}>
                {activeTab === "Account Info" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <button type="button" disabled className="w-full text-left px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 cursor-not-allowed">
                          {formData.email}
                        </button>
                      </div>
                    </div>

                    <div className="max-w-[calc(50%-12px)]">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <button type="button" disabled className="w-full text-left px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 cursor-not-allowed">
                        {formData.role}
                      </button>
                    </div>

                    <div className="pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Change Password</label>
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
                )}
                
                {activeTab === "Settings" && (
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                    <div className="flex-1 flex flex-col justify-between gap-8">
                      <div className="flex items-center justify-between py-4">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEmailNotifications(s => !s)}
                          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${emailNotifications ? 'bg-green-600' : 'bg-gray-400'}`}
                        >
                          <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-4">
                        <div>
                          <p className="font-medium">SMS Notifications</p>
                          <p className="text-sm text-gray-500">Receive notifications via text message</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSmsNotifications(s => !s)}
                          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${smsNotifications ? 'bg-green-600' : 'bg-gray-400'}`}
                        >
                          <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${smsNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-4">
                        <div>
                          <p className="font-medium">In-App Notifications</p>
                          <p className="text-sm text-gray-500">Receive notifications in the application</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setInAppNotifications(s => !s)}
                          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${inAppNotifications ? 'bg-green-600' : 'bg-gray-400'}`}
                        >
                          <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${inAppNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleSaveSettings}
                          disabled={settingsLoading}
                          className="inline-flex items-center gap-3 px-5 py-3 rounded-md bg-[#19765A] text-white hover:bg-[#165e4f] shadow disabled:opacity-50"
                        >
                          {settingsLoading ? (
                            <>
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="text-sm">Saving...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              <span className="text-sm">Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Privacy & Data" && (
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold mb-4">Privacy & Data</h3>
                    <div className="flex flex-col gap-8">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Emotion Data Consent</h4>
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Allow the application to collect and analyze emotional data during quiz sessions.</p>
                            <a href="#" className="text-sm text-emerald-600 font-medium mt-3 inline-block">Read our privacy policy</a>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEmotionConsent(v => !v)}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${emotionConsent ? 'bg-emerald-600' : 'bg-gray-300'}`}
                          >
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${emotionConsent ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Export Your Data</h4>
                        <p className="text-sm text-gray-500 mt-2">Download a copy of your personal data and activity history.</p>
                        <div className="mt-6 flex flex-col items-start gap-4">
                          <button 
                            onClick={handleExportData}
                            className="inline-flex items-center gap-3 px-4 py-2 rounded-md bg-[#19765A] text-white hover:bg-[#165e4f] shadow"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v13m0 0l-4-4m4 4l4-4M21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6"/></svg>
                            <span className="text-sm">Export All Data</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleSavePrivacySettings}
                            disabled={settingsLoading}
                            className="inline-flex items-center gap-3 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow disabled:opacity-50"
                          >
                            {settingsLoading ? (
                              <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                                <span>Save Privacy Settings</span>
                              </>
                            )}
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