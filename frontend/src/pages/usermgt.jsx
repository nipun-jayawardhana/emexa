// frontend/src/pages/usermgt.jsx

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import axios from 'axios';
import {
  getUsers,
  deleteUser,
  getTeacherApprovals,
  approveTeacher,
  rejectTeacher,
} from "../services/user.service";
import Modal from "react-modal";
import Header from "../components/headerorigin.jsx";
import Sidebar from "../components/sidebarorigin.jsx";

const StatusTag = ({ status }) => (
  <span className={`px-3 py-1 rounded text-xs font-medium ${
    status === "Active" ? "bg-green-100 text-green-700" :
    status === "Inactive" ? "bg-red-100 text-red-700" :
    "bg-gray-100 text-gray-700"
  }`}>
    {status || "Pending"}
  </span>
);

const RoleTag = ({ role }) => (
  <span className={`px-3 py-1 rounded text-xs font-medium ${
    role === "Admin" ? "bg-purple-100 text-purple-700" :
    role === "Teacher" ? "bg-blue-100 text-blue-700" :
    role === "Student" ? "bg-green-100 text-green-700" :
    "bg-gray-100 text-gray-700"
  }`}>
    {role}
  </span>
);

const UserManagement = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [teacherApprovals, setTeacherApprovals] = useState([]);
  const [studentApprovals, setStudentApprovals] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [tab, setTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [adminProfileImage, setAdminProfileImage] = useState(null);

  const roles = ["All Roles", "Admin", "Teacher", "Student"];

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
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

    // Optimistic preview
    const reader = new FileReader();
    reader.onload = (evt) => {
      setAdminProfileImage(evt.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary via backend
    try {
      const formData = new FormData();
      formData.append('profile', file);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      console.log('📤 Uploading admin profile image...');
      
      const res = await axios.post('/api/users/upload-profile', formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Upload response:', res.data);

      // Get Cloudinary URL from response
      const cloudinaryUrl = res.data?.profileImage;
      if (cloudinaryUrl) {
        setAdminProfileImage(cloudinaryUrl);
        localStorage.setItem('adminProfileImage', cloudinaryUrl);
        
        // Dispatch event for header update
        window.dispatchEvent(new CustomEvent('adminProfileImageChanged', { detail: cloudinaryUrl }));
        
        alert('Profile picture updated successfully!');
        
        // Refetch profile to ensure sync
        try {
          const profileRes = await axios.get('/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (profileRes.data?.profileImage) {
            setAdminProfileImage(profileRes.data.profileImage);
            localStorage.setItem('adminProfileImage', profileRes.data.profileImage);
          }
        } catch (refetchErr) {
          console.warn('Refetch failed:', refetchErr.message);
        }
      }
    } catch (err) {
      console.error('❌ Upload failed:', err?.response?.data || err.message);
      alert('Failed to upload profile picture. Please try again.');
      
      // Revert to previous image on failure
      const storedImage = localStorage.getItem('adminProfileImage');
      if (storedImage) {
        setAdminProfileImage(storedImage);
      }
    } finally {
      e.target.value = '';
    }
  };

  const navigateToDashboard = (type) => {
    localStorage.setItem("adminViewingAs", type === "student" ? "student" : "teacher");
    navigate(type === "student" ? "/dashboard" : "/teacher-dashboard");
  };

  const adminMenuItems = [
    {
      id: "userManagement",
      label: "User Management",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
      onClick: () => localStorage.removeItem("adminViewingAs"),
    },
    {
      id: "studentPreview",
      label: "Student Dashboard",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0H5" /></svg>,
      onClick: () => navigateToDashboard("student"),
    },
    {
      id: "teacherPreview",
      label: "Teacher Dashboard",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7" /></svg>,
      onClick: () => navigateToDashboard("teacher"),
    },
    {
      id: "quizzes",
      label: "Quizzes",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2" /></svg>,
      onClick: () => navigate("/quizzes"),
    },
  ];

  useEffect(() => {
    const admin = localStorage.getItem("adminUser");
    if (admin) setAdminUser(JSON.parse(admin));
    
    const savedImage = localStorage.getItem('adminProfileImage');
    if (savedImage) {
      setAdminProfileImage(savedImage);
    }
  }, []);

  // Fetch admin profile from server to get profileImage
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const res = await axios.get('/api/users/profile', {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined
          }
        });
        
        console.log('📥 Admin profile fetched:', res.data);
        
        if (res.data?.profileImage) {
          setAdminProfileImage(res.data.profileImage);
          localStorage.setItem('adminProfileImage', res.data.profileImage);
        }
      } catch (err) {
        console.warn('Failed to fetch admin profile image:', err?.response?.data || err.message);
      }
    };
    fetchAdminProfile();
  }, []);

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    if (!adminToken && (!token || role !== "admin")) {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, teacherRes, studentRes] = await Promise.allSettled([
          getUsers(),
          getTeacherApprovals(),
          fetch("/api/auth/student-approvals", { credentials: "include" }).then(r => r.ok ? r.json() : [])
        ]);

        setUsers(usersRes.status === "fulfilled" ? usersRes.value || [] : []);
        setTeacherApprovals(teacherRes.status === "fulfilled" ? teacherRes.value || [] : []);
        setStudentApprovals(studentRes.status === "fulfilled" ? studentRes.value || [] : []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openModal = (type, user) => { setModalType(type); setSelectedUser(user); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setModalType(""); setSelectedUser(null); };

  const handleDeleteUser = (id) => {
    deleteUser(id).then(() => {
      setUsers(prev => prev.filter(u => u._id !== id));
      closeModal();
    });
  };

  const handleApproveStudent = async (id) => {
    try {
      const res = await fetch(`/api/auth/student-approvals/${id}/approve`, { method: "PUT", credentials: "include" });
      if (res.ok) setStudentApprovals(prev => prev.map(a => a._id === id ? { ...a, status: "Approved" } : a));
    } catch (err) { console.error(err); }
  };

  const handleRejectStudent = async (id) => {
    try {
      const res = await fetch(`/api/auth/student-approvals/${id}/reject`, { method: "PUT", credentials: "include" });
      if (res.ok) setStudentApprovals(prev => prev.map(a => a._id === id ? { ...a, status: "Rejected" } : a));
    } catch (err) { console.error(err); }
  };

  const filteredUsers = users.filter(u =>
    (selectedRole === "All Roles" || u.role === selectedRole) &&
    (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pendingTeacherApprovals = teacherApprovals.filter(a => !a.status).length;
  const pendingStudentApprovals = studentApprovals.filter(a => !a.status).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-24"></div>
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

          <p className="mt-6 text-center text-gray-500 text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleProfileImageChange}
        style={{ display: 'none' }}
      />
      
      <Header userName={adminUser?.name || "Admin"} userRole="admin" />

      <div className="flex">
        <Sidebar activeMenuItem="userManagement" menuItems={adminMenuItems} />

        <main className="flex-1 ml-64 pt-20 px-8">
          {/* Admin Profile Header Section */}
          <div className="relative mb-12">
            <div className="bg-gradient-to-r from-teal-400 to-teal-600 h-24 rounded-t-lg"></div>
            <div className="bg-white h-24"></div>
            
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-4 z-10">
              <div className="relative">
                <div className="bg-white rounded-full p-1 shadow-lg">
                  <img
                    src={adminProfileImage || "https://via.placeholder.com/120"}
                    alt="Admin Profile"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                </div>
                <button
                  onClick={handleProfileImageClick}
                  type="button"
                  className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 shadow-lg transition-colors"
                >
                  <Camera size={18} />
                </button>
              </div>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">{adminUser?.name || 'Admin'}</h1>
                <p className="text-gray-600 text-sm">{adminUser?.email || 'admin@emexa.edu'}</p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-gray-900">User Management Dashboard</h1>
              <p className="text-gray-600 mt-3 text-lg">Manage all users, approvals, and system access</p>
            </div>

            <div className="bg-white rounded-t-lg shadow-sm border-b border-gray-200">
              <div className="flex gap-10 px-8 pt-5">
                <button onClick={() => setTab("users")} className={`pb-4 text-base font-medium border-b-3 transition-all ${tab === "users" ? "text-emerald-600 border-emerald-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
                  All Users
                </button>
                <button onClick={() => setTab("teacher-approvals")} className={`pb-4 text-base font-medium relative ${tab === "teacher-approvals" ? "text-emerald-600 border-b-3 border-emerald-600" : "text-gray-500 hover:text-gray-700"}`}>
                  Teacher Approvals
                  {pendingTeacherApprovals > 0 && <span className="ml-2 px-2.5 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">{pendingTeacherApprovals}</span>}
                </button>
                <button onClick={() => setTab("student-approvals")} className={`pb-4 text-base font-medium relative ${tab === "student-approvals" ? "text-emerald-600 border-b-3 border-emerald-600" : "text-gray-500 hover:text-gray-700"}`}>
                  Student Approvals
                  {pendingStudentApprovals > 0 && <span className="ml-2 px-2.5 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">{pendingStudentApprovals}</span>}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 border-t-0">
              {tab === "users" && (
                <>
                  <div className="p-8 border-b border-gray-200 flex items-center gap-6">
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-96 text-base"
                    />
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                        className="px-8 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 flex items-center justify-between min-w-56 text-base font-medium text-gray-700 shadow-sm"
                      >
                        {selectedRole}
                        <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {showRoleDropdown && (
                        <div className="absolute top-full mt-2 w-full min-w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                          {roles.map(role => (
                            <button
                              key={role}
                              onClick={() => { setSelectedRole(role); setShowRoleDropdown(false); }}
                              className="w-full px-6 py-4 text-left hover:bg-emerald-50 flex items-center justify-between text-base font-medium transition"
                            >
                              <span>{role}</span>
                              {selectedRole === role && (
                                <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Name</th>
                          <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Email</th>
                          <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Role</th>
                          <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Date Added</th>
                          <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-32 text-gray-500 text-lg font-medium">
                              No users found.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map(u => (
                            <tr key={u._id} className="hover:bg-gray-50 transition">
                              <td className="px-8 py-5 text-base font-medium text-gray-900">{u.name}</td>
                              <td className="px-8 py-5 text-base text-gray-600">{u.email}</td>
                              <td className="px-8 py-5"><RoleTag role={u.role} /></td>
                              <td className="px-8 py-5"><StatusTag status={u.status} /></td>
                              <td className="px-8 py-5 text-base text-gray-600">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                              </td>
                              <td className="px-8 py-5 text-base">
                                <button onClick={() => openModal("view", u)} className="text-emerald-600 hover:text-emerald-800 font-semibold mr-6">View</button>
                                <button onClick={() => openModal("delete", u)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {tab === "teacher-approvals" && (
                <div className="p-10"><ApprovalTab approvals={teacherApprovals} title="Teacher Approval Requests" onApprove={approveTeacher} onReject={rejectTeacher} /></div>
              )}

              {tab === "student-approvals" && (
                <div className="p-10"><ApprovalTab approvals={studentApprovals} title="Student Approval Requests" onApprove={handleApproveStudent} onReject={handleRejectStudent} /></div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Modal isOpen={modalOpen} onRequestClose={closeModal} className="bg-white rounded-2xl shadow-2xl max-w-lg mx-auto p-8 outline-none" overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" ariaHideApp={false}>
        {modalType === "view" && <ViewUserModal user={selectedUser} onClose={closeModal} />}
        {modalType === "delete" && <DeleteUserModal user={selectedUser} onSubmit={() => handleDeleteUser(selectedUser._id)} onCancel={closeModal} />}
      </Modal>
    </div>
  );
};

const ApprovalTab = ({ approvals = [], title, onApprove, onReject }) => (
  <div>
    <h2 className="text-3xl font-bold mb-4 text-gray-900">{title}</h2>
    <p className="text-gray-600 mb-10 text-lg">Review and manage pending registration requests</p>
    {approvals.length === 0 ? (
      <div className="text-center py-32 text-gray-500 border-2 border-dashed border-gray-300 rounded-2xl text-xl font-medium">
        No pending requests
      </div>
    ) : (
      <div className="space-y-8">
        {approvals.map(ap => (
          <div key={ap._id} className="border rounded-2xl p-8 hover:shadow-xl transition bg-gradient-to-r from-emerald-50/50 to-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-2xl text-gray-900">{ap.name}</h3>
                <p className="text-gray-700 mt-2 text-lg">{ap.email}</p>
                <p className="text-gray-500 mt-3">Requested: {ap.createdAt ? new Date(ap.createdAt).toLocaleDateString() : "N/A"}</p>
                {ap.qualifications && <p className="mt-6 text-gray-800 text-base"><strong className="font-bold">Qualifications:</strong> {ap.qualifications}</p>}
              </div>
              <div className="flex gap-4">
                {!ap.status ? (
                  <>
                    <button onClick={() => onApprove(ap._id)} className="px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-lg shadow-md">Approve</button>
                    <button onClick={() => onReject(ap._id)} className="px-8 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-bold text-lg">Reject</button>
                  </>
                ) : ap.status === "Approved" ? (
                  <span className="px-8 py-4 bg-green-100 text-green-700 rounded-xl font-bold text-xl">Approved</span>
                ) : (
                  <span className="px-8 py-4 bg-red-100 text-red-700 rounded-xl font-bold text-xl">Rejected</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const ViewUserModal = ({ user, onClose }) => (
  <div>
    <h2 className="text-3xl font-bold mb-8 text-gray-900">User Profile</h2>
    <div className="space-y-6 text-lg">
      <p><strong className="text-gray-700">Name:</strong> {user.name}</p>
      <p><strong className="text-gray-700">Email:</strong> {user.email}</p>
      <p><strong className="text-gray-700">Role:</strong> <RoleTag role={user.role} /></p>
      <p><strong className="text-gray-700">Status:</strong> <StatusTag status={user.status} /></p>
      <p><strong className="text-gray-700">Joined:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
    </div>
    <div className="mt-12 text-right">
      <button onClick={onClose} className="px-10 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-xl">Close</button>
    </div>
  </div>
);

const DeleteUserModal = ({ user, onSubmit, onCancel }) => (
  <div>
    <h2 className="text-3xl font-bold mb-6 text-red-600">Delete User</h2>
    <p className="text-gray-700 mb-10 text-lg">Are you sure you want to permanently delete <strong className="font-bold">{user.name}</strong>? This action cannot be undone.</p>
    <div className="flex justify-end gap-6">
      <button onClick={onCancel} className="px-10 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-bold text-xl">Cancel</button>
      <button onClick={onSubmit} className="px-10 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold text-xl">Delete User</button>
    </div>
  </div>
);

export default UserManagement;