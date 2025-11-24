// frontend/src/pages/usermgt.jsx

import React, { useEffect, useState } from "react";
import { getUsers, addUser, updateUser, deleteUser, getTeacherApprovals, approveTeacher, rejectTeacher } from "../services/user.service";
import Modal from "react-modal";

// Helper tag components for status and roles
const StatusTag = ({ status }) => (
  <span className={`px-3 py-1 rounded text-xs font-medium ${
    status === "Active" ? "bg-green-100 text-green-700"
    : status === "Inactive" ? "bg-red-100 text-red-700"
    : "bg-gray-100 text-gray-700"
  }`}>
    {status}
  </span>
);

const RoleTag = ({ role }) => (
  <span className={`px-3 py-1 rounded text-xs font-medium ${
    role === "Admin" ? "bg-purple-100 text-purple-700"
    : role === "Teacher" ? "bg-blue-100 text-blue-700"
    : role === "Student" ? "bg-green-100 text-green-700"
    : "bg-gray-100 text-gray-700"
  }`}>
    {role}
  </span>
);

const UserManagement = () => {
  // Page state
  const [users, setUsers] = useState([]);
  const [teacherApprovals, setTeacherApprovals] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState({
    Admin: false,
    Teacher: false,
    Student: false
  });
  const [tab, setTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch users and approvals
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getUsers().catch(err => {
        console.error("Error fetching users:", err);
        return [];
      }),
      getTeacherApprovals().catch(err => {
        console.error("Error fetching teacher approvals:", err);
        return [];
      })
    ]).then(([usersData, approvalsData]) => {
      setUsers(usersData);
      setTeacherApprovals(approvalsData);
      setLoading(false);
    });
  }, []);

  // CRUD handlers
  const openModal = (type, user) => {
    setSelectedUser(user || null);
    setModalType(type);
    setModalOpen(true);
  };
  
  const closeModal = () => {
    setModalOpen(false);
    setModalType("");
    setSelectedUser(null);
  };

  const handleAddUser = (user) => {
    addUser(user)
      .then(newUser => {
        setUsers([...users, newUser]);
        closeModal();
      })
      .catch(err => {
        console.error("Error adding user:", err);
        alert("Failed to add user. Please try again.");
      });
  };
  
  const handleUpdateUser = (user) => {
    updateUser(user._id, user)
      .then(updatedUser => {
        setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u));
        closeModal();
      })
      .catch(err => {
        console.error("Error updating user:", err);
        alert("Failed to update user. Please try again.");
      });
  };
  
  const handleDeleteUser = (id) => {
    deleteUser(id)
      .then(() => {
        setUsers(users.filter(u => u._id !== id));
        closeModal();
      })
      .catch(err => {
        console.error("Error deleting user:", err);
        alert("Failed to delete user. Please try again.");
      });
  };
  
  const handleApproveTeacher = (id) => {
    approveTeacher(id)
      .then(() => {
        setTeacherApprovals(teacherApprovals.map(appr => 
          appr._id === id ? {...appr, status:"Approved"} : appr
        ));
      })
      .catch(err => {
        console.error("Error approving teacher:", err);
        alert("Failed to approve teacher. Please try again.");
      });
  };
  
  const handleRejectTeacher = (id) => {
    rejectTeacher(id)
      .then(() => {
        setTeacherApprovals(teacherApprovals.map(appr => 
          appr._id === id ? {...appr, status:"Rejected"} : appr
        ));
      })
      .catch(err => {
        console.error("Error rejecting teacher:", err);
        alert("Failed to reject teacher. Please try again.");
      });
  };

  const toggleRole = (role) => {
    setSelectedRoles(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };

  const allRolesSelected = selectedRoles.Admin && selectedRoles.Teacher && selectedRoles.Student;
  const noRolesSelected = !selectedRoles.Admin && !selectedRoles.Teacher && !selectedRoles.Student;
  
  const getRoleDisplayText = () => {
    if (noRolesSelected || allRolesSelected) return "All Roles";
    const selected = Object.keys(selectedRoles).filter(key => selectedRoles[key]);
    if (selected.length === 1) return selected[0];
    return "All Roles";
  };

  // Filtering
  const filteredUsers = users.filter(u => {
    // If no roles selected, show all users
    const matchesRole = noRolesSelected || allRolesSelected || selectedRoles[u.role];
    const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const pendingApprovals = teacherApprovals.filter(x => !x.status).length;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">User Management</h1>
          <p className="text-sm text-gray-600">Add, edit, and manage users in your quiz system</p>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 flex gap-6 border-b border-gray-200">
          <button 
            className={`pb-3 font-medium text-sm ${
              tab === "users" 
                ? "text-teal-600 border-b-2 border-teal-600" 
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setTab("users")}
          >
            All Users
          </button>
          <button 
            className={`pb-3 font-medium text-sm relative ${
              tab === "approvals" 
                ? "text-teal-600 border-b-2 border-teal-600" 
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setTab("approvals")}
          >
            Teacher Approvals
            {pendingApprovals > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 text-xs font-medium">
                {pendingApprovals}
              </span>
            )}
          </button>
        </div>
        
        {tab === "users" && (
          <div>
            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input 
                  type="text"
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 w-80" 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 flex items-center gap-2 min-w-[140px] justify-between"
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  >
                    <span className="text-sm">{getRoleDisplayText()}</span>
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showRoleDropdown && (
                    <div className="absolute top-full mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-20">
                      <button
                        className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between text-sm border-b border-gray-100"
                        onClick={() => {
                          const allSelected = allRolesSelected;
                          setSelectedRoles({
                            Admin: !allSelected,
                            Teacher: !allSelected,
                            Student: !allSelected
                          });
                          setShowRoleDropdown(false);
                        }}
                      >
                        <span>All Roles</span>
                        {(allRolesSelected || noRolesSelected) && (
                          <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      
                      {["Admin", "Teacher", "Student"].map(role => (
                        <button
                          key={role}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between text-sm"
                          onClick={() => {
                            toggleRole(role);
                            setShowRoleDropdown(false);
                          }}
                        >
                          <span>{role}</span>
                          {selectedRoles[role] && (
                            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <button
                className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors font-medium text-sm flex items-center gap-2"
                onClick={() => openModal("add")}
              >
                <span className="text-lg font-normal">+</span>
                Add User
              </button>
            </div>
            
            {/* Users Table */}
            <div className="border border-gray-200 rounded">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">NAME</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">EMAIL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ROLE</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">STATUS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">DATE ADDED</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500 text-sm">
                        No users found. Click "Add User" to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><RoleTag role={u.role}/></td>
                        <td className="px-6 py-4 whitespace-nowrap"><StatusTag status={u.status}/></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {u.dateAdded ? new Date(u.dateAdded).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-4">
                          <button 
                            className="text-blue-600 hover:text-blue-800 font-medium" 
                            onClick={() => openModal("edit", u)}
                          >
                            Edit
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 font-medium" 
                            onClick={() => openModal("delete", u)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {tab === "approvals" && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Teacher Approval Requests</h2>
              <p className="text-sm text-gray-600">Review and approve teacher registration requests</p>
            </div>
            
            {teacherApprovals.length === 0 ? (
              <div className="border border-gray-200 rounded p-8 text-center">
                <p className="text-gray-500 text-sm">No teacher approval requests at this time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teacherApprovals.map(ap => (
                  <div 
                    key={ap._id} 
                    className="border border-gray-200 rounded p-6 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">{ap.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{ap.email}</p>
                        <p className="text-xs text-gray-500 mb-3">
                          Requested on: {ap.requestedOn ? new Date(ap.requestedOn).toLocaleDateString() : 'N/A'}
                        </p>
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900">Qualifications:</span>
                          <p className="text-gray-700 mt-1">{ap.qualifications || 'Not provided'}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {!ap.status ? (
                          <>
                            <button 
                              className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors font-medium text-sm flex items-center gap-2" 
                              onClick={() => handleApproveTeacher(ap._id)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button 
                              className="px-4 py-2 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm flex items-center gap-2" 
                              onClick={() => handleRejectTeacher(ap._id)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </>
                        ) : ap.status === "Approved" ? (
                          <span className="px-4 py-2 rounded bg-green-100 text-green-700 font-medium text-sm">Approved</span>
                        ) : (
                          <span className="px-4 py-2 rounded bg-red-100 text-red-700 font-medium text-sm">Rejected</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Modals */}
        <Modal
          isOpen={modalOpen} 
          onRequestClose={closeModal}
          className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 outline-none"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          ariaHideApp={false}
        >
          {modalType === "add" && (
            <AddEditUserForm
              onSubmit={handleAddUser}
              onCancel={closeModal}
              type="Add"
            />
          )}
          {modalType === "edit" && (
            <AddEditUserForm
              user={selectedUser}
              onSubmit={handleUpdateUser}
              onCancel={closeModal}
              type="Edit"
            />
          )}
          {modalType === "delete" && (
            <DeleteUserModal 
              user={selectedUser} 
              onSubmit={() => handleDeleteUser(selectedUser._id)} 
              onCancel={closeModal}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

// Add/Edit User Modal Component
const AddEditUserForm = ({user, onSubmit, onCancel, type}) => {
  const [data, setData] = useState(user || {name:"", email:"", role:"Student", status:"Active"});
  
  return (
    <form className="space-y-4" onSubmit={e => {e.preventDefault(); onSubmit(data);}}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{type === "Add" ? "Add New User" : "Edit User"}</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input 
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500" 
          required 
          value={data.name} 
          onChange={e => setData({...data, name: e.target.value})}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input 
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500" 
          required 
          type="email" 
          value={data.email} 
          onChange={e => setData({...data, email: e.target.value})}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select 
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500" 
          required 
          value={data.role} 
          onChange={e => setData({...data, role: e.target.value})}
        >
          <option value="Student">Student</option>
          <option value="Teacher">Teacher</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select 
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500" 
          required 
          value={data.status} 
          onChange={e => setData({...data, status: e.target.value})}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
      
      <div className="flex gap-3 justify-end pt-4">
        <button 
          type="button" 
          className="px-4 py-2 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm" 
          onClick={onCancel}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors font-medium text-sm"
        >
          {type === "Add" ? "Add User" : "Update User"}
        </button>
      </div>
    </form>
  );
};

// Delete Modal
const DeleteUserModal = ({user, onSubmit, onCancel}) => (
  <div>
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h2>
    <p className="text-sm text-gray-600 mb-6">
      Are you sure you want to delete the user <span className="font-semibold text-gray-900">{user.name}</span>? 
      This action cannot be undone.
    </p>
    <div className="flex gap-3 justify-end">
      <button 
        className="px-4 py-2 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm" 
        onClick={onCancel}
      >
        Cancel
      </button>
      <button 
        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors font-medium text-sm" 
        onClick={onSubmit}
      >
        Delete User
      </button>
    </div>
  </div>
);

export default UserManagement;