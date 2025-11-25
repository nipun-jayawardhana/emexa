import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/sidebarorigin';
import Header from '../components/headerorigin';
import AdminViewWrapper from '../components/AdminViewWrapper';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [activeMenuItem, setActiveMenuItem] = useState('profile');
  const navigate = useNavigate();

  const adminToken = localStorage.getItem('adminToken');
  const isAdminViewing = localStorage.getItem('adminViewingAs');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student'
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    emotionDataConsent: true
  });

  useEffect(() => {
    fetchUserData();
    setUserName(localStorage.getItem('userName') || 'Student');
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token && !adminToken) {
        navigate('/login');
        return;
      }

      if (!isAdminViewing) {
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const user = response.data;
        setUserData(user);
        setFormData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || 'student'
        });
        setNotificationSettings(user.notificationSettings || {
          emailNotifications: true,
          smsNotifications: false,
          inAppNotifications: true
        });
        setPrivacySettings(user.privacySettings || {
          emotionDataConsent: true
        });
      } else {
        // Mock data for admin viewing
        const mockData = {
          name: 'Anna Faris',
          email: 'anna.faris@school.edu',
          role: 'student',
          profileImage: null,
          recentActivity: []
        };
        setUserData(mockData);
        setFormData({
          name: mockData.name,
          email: mockData.email,
          role: mockData.role
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401 && !isAdminViewing) {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationToggle = (key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyToggle = (key) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveAccountInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/user/update-profile',
        formData,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.data) {
        alert('Profile updated successfully!');
        fetchUserData();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/user/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.data) {
        alert('Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleSaveNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/user/notification-settings',
        notificationSettings,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.data) {
        alert('Notification settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving notifications:', error);
      alert('Failed to save notification settings');
    }
  };

  const handleSavePrivacy = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/user/privacy-settings',
        privacySettings,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.data) {
        alert('Privacy settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      alert('Failed to save privacy settings');
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/user/export-data', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'user-data.json';
      a.click();
      window.URL.revokeObjectURL(url);
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const ProfileContent = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-teal-400 to-teal-600 h-32 rounded-t-lg"></div>
        
        <div className="bg-white rounded-b-lg shadow-sm p-8 -mt-16">
          <div className="flex items-start gap-6 mb-8 relative">
            <div className="relative z-10">
              <img 
                src={userData?.profileImage || "https://via.placeholder.com/120"} 
                alt="Profile" 
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <button className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 shadow-lg transition-colors">
                <Camera size={18} />
              </button>
            </div>
            
            <div className="flex-1 mt-16">
              <h1 className="text-2xl font-bold text-gray-900">{userData?.name || 'Student'}</h1>
              <p className="text-gray-600 capitalize">{userData?.role || 'Student'} - 2nd Year</p>
              <p className="text-gray-600">{userData?.email || ''}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex gap-8 border-b border-gray-200">
              <button 
                onClick={() => setActiveTab('account')}
                className={`pb-4 px-2 transition relative ${
                  activeTab === 'account' 
                    ? 'text-teal-600 font-medium' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Account Info
                {activeTab === 'account' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></div>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`pb-4 px-2 transition relative ${
                  activeTab === 'settings' 
                    ? 'text-teal-600 font-medium' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Settings
                {activeTab === 'settings' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></div>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('activity')}
                className={`pb-4 px-2 transition relative ${
                  activeTab === 'activity' 
                    ? 'text-teal-600 font-medium' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Recent Activity
                {activeTab === 'activity' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></div>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('privacy')}
                className={`pb-4 px-2 transition relative ${
                  activeTab === 'privacy' 
                    ? 'text-teal-600 font-medium' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Privacy & Data
                {activeTab === 'privacy' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></div>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <input 
                  type="text"
                  value={formData.role}
                  disabled
                  className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 capitalize cursor-not-allowed"
                />
              </div>

              <div className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Change Password
                </button>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleSaveAccountInfo}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 transition-colors"
                >
                  <span>💾</span> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.emailNotifications}
                      onChange={() => handleNotificationToggle('emailNotifications')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                    <p className="text-sm text-gray-600">Receive notifications via text message</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.smsNotifications}
                      onChange={() => handleNotificationToggle('smsNotifications')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="font-medium text-gray-900">In-App Notifications</h3>
                    <p className="text-sm text-gray-600">Receive notifications in the application</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.inAppNotifications}
                      onChange={() => handleNotificationToggle('inAppNotifications')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSaveNotifications}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 transition-colors"
                >
                  <span>💾</span> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              
              {userData?.recentActivity && userData.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {userData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-teal-600">{activity.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>📅 {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>🔄 Attempts: {activity.attempts || 1}</span>
                        </div>
                      </div>
                      
                      {activity.score && (
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          activity.score >= 90 ? 'bg-green-100 text-green-800' :
                          activity.score >= 80 ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          Score: {activity.score}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-500 font-medium">No recent activity yet</p>
                  <p className="text-sm text-gray-400 mt-2">Your quiz attempts will appear here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Privacy & Data</h2>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Emotion Data Consent</h3>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 mb-3">
                        Allow the application to collect and analyze emotional data during quiz sessions to improve learning experience.
                      </p>
                      <a href="#" className="text-sm text-teal-600 hover:underline">Read our privacy policy</a>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                      <input 
                        type="checkbox" 
                        checked={privacySettings.emotionDataConsent}
                        onChange={() => handlePrivacyToggle('emotionDataConsent')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Export Your Data</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Download a copy of your personal data and activity history. The export includes your profile information, quiz history, and performance data.
                  </p>
                  <button 
                    onClick={handleExportData}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 transition-colors"
                  >
                    <span>⬇️</span> Export All Data
                  </button>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleSavePrivacy}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 transition-colors"
                  >
                    <span>💾</span> Save Privacy Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Change Password</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input 
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input 
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input 
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleChangePassword}
                  className="flex-1 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Admin viewing check
  if (isAdminViewing && adminToken) {
    return (
      <AdminViewWrapper dashboardType="student">
        <ProfileContent />
      </AdminViewWrapper>
    );
  }

  // Regular student view
  return (
    <div className="min-h-screen bg-white">
      <Header userName={userName} userRole="student" />
      <Sidebar activeMenuItem={activeMenuItem} setActiveMenuItem={setActiveMenuItem} />
      <div className="ml-52 pt-14">
        <ProfileContent />
      </div>
    </div>
  );
};

export default Profile;