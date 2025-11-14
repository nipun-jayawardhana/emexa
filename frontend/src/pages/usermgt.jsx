// frontend/src/pages/usermgt.jsx

import React, { useEffect, useState } from "react";
import { getUsers, addUser, updateUser, deleteUser, getTeacherApprovals, approveTeacher, rejectTeacher } from "../services/user.service";
import Modal from "react-modal";

// Helper tag components for status and roles
const StatusTag = ({ status }) => (
  <span className={`px-2 py-1 rounded text-xs ${
    status === "Active" ? "bg-green-100 text-green-700"
    : status === "Inactive" ? "bg-red-100 text-red-700"
    : "bg-gray-100 text-gray-700"
  }`}>
    {status}
  </span>
);

const RoleTag = ({ role }) => (
  <span className={`px-2 py-1 rounded text-xs ${
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
  const [modalType, setModalType] = useState(""); // "add" | "edit" | "delete"
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState({Admin:true, Teacher:true, Student:true});
  const [tab, setTab] = useState("users");
  const [loading, setLoading] = useState(true);

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

  // Filtering and rendering
  const filteredUsers = users.filter(u => roleFilter[u.role]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="p-6 user-management-page pt-24">
      <div className="mb-4 flex items-center justify-between border-b pb-2">
        <div className="text-2xl font-semibold">User Management</div>
        <div>
          <button
            className="px-6 py-2 rounded bg-green-700 text-white hover:bg-green-800 transition-colors"
            onClick={() => openModal("add")}
          >
            + Add User
          </button>
        </div>
      </div>
      
      <div className="mb-4 flex gap-8">
        <button 
          className={`px-6 py-1 font-bold ${tab==="users"?"border-b-2 border-green-700":""}`} 
          onClick={() => setTab("users")}
        >
          All Users
        </button>
        <button 
          className={`px-6 py-1 font-bold ${tab==="approvals"?"border-b-2 border-green-700":""}`} 
          onClick={() => setTab("approvals")}
        >
          Teacher Approvals
          {teacherApprovals.filter(x => !x.status).length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded bg-green-700 text-white text-xs inline-block">
              {teacherApprovals.filter(x => !x.status).length}
            </span>
          )}
        </button>
      </div>
      
      {tab === "users" && (
        <div>
          {/* Role filter */}
          <div className="mb-2 flex gap-4">
            {["Admin","Teacher","Student"].map(role => (
              <label key={role} className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={roleFilter[role]} 
                  onChange={() => {
                    setRoleFilter({...roleFilter, [role]: !roleFilter[role]});
                  }}
                />
                <span className="ml-2">{role}</span>
              </label>
            ))}
            <input 
              className="ml-auto px-3 py-1 border rounded" 
              placeholder="Search…" 
              onChange={e => {
                // Optional: Add search functionality
              }} 
            />
          </div>
          
          {/* Users Table */}
          <table className="w-full text-left border bg-white rounded shadow mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No users found. Click "Add User" to create one.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u._id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{u.name}</td>
                    <td>{u.email}</td>
                    <td><RoleTag role={u.role}/></td>
                    <td><StatusTag status={u.status}/></td>
                    <td>{u.dateAdded ? new Date(u.dateAdded).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button 
                        className="text-blue-700 mr-2 underline hover:text-blue-900" 
                        onClick={() => openModal("edit", u)}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-red-700 underline hover:text-red-900" 
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
      )}
      
      {tab === "approvals" && (
        <div>
          {teacherApprovals.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded">
              <p className="text-gray-500">No teacher approval requests at this time.</p>
            </div>
          ) : (
            teacherApprovals.map(ap => (
              <div 
                key={ap._id} 
                className={`mb-3 p-4 rounded border shadow ${
                  ap.status === "Rejected" ? "bg-red-50" : "bg-green-50"
                }`}
              >
                <div className="font-semibold text-lg">{ap.name}</div>
                <div className="text-gray-700">{ap.email}</div>
                <div className="text-xs text-gray-500">
                  Requested on: {ap.requestedOn ? new Date(ap.requestedOn).toLocaleDateString() : 'N/A'}
                </div>
                <div className="text-sm mt-2">
                  <span className="font-bold">Qualifications:</span> {ap.qualifications || 'Not provided'}
                </div>
                <div className="mt-2 flex gap-2">
                  {!ap.status && (
                    <>
                      <button 
                        className="px-4 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors" 
                        onClick={() => handleApproveTeacher(ap._id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="px-4 py-1 rounded bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors" 
                        onClick={() => handleRejectTeacher(ap._id)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {ap.status === "Approved" && (
                    <span className="px-3 py-1 rounded bg-green-100 text-green-700">Approved</span>
                  )}
                  {ap.status === "Rejected" && (
                    <span className="px-3 py-1 rounded bg-red-100 text-red-700">Rejected</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Modal: Add/Edit/Delete */}
      <Modal
        isOpen={modalOpen} 
        onRequestClose={closeModal}
        className="bg-white border p-8 rounded shadow max-w-md mx-auto mt-32"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
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
  );
};

// Add/Edit User Modal Component
const AddEditUserForm = ({user, onSubmit, onCancel, type}) => {
  const [data, setData] = useState(user || {name:"", email:"", role:"Student", status:"Active"});
  
  return (
    <form className="space-y-4" onSubmit={e => {e.preventDefault(); onSubmit(data);}}>
      <div className="text-xl font-bold mb-2">{type} User</div>
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input 
          className="mt-1 border px-2 py-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500" 
          required 
          value={data.name} 
          onChange={e => setData({...data, name: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input 
          className="mt-1 border px-2 py-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500" 
          required 
          type="email" 
          value={data.email} 
          onChange={e => setData({...data, email: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Role</label>
        <select 
          className="mt-1 border px-2 py-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500" 
          required 
          value={data.role} 
          onChange={e => setData({...data, role: e.target.value})}
        >
          <option value="Admin">Admin</option>
          <option value="Teacher">Teacher</option>
          <option value="Student">Student</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Status</label>
        <select 
          className="mt-1 border px-2 py-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500" 
          required 
          value={data.status} 
          onChange={e => setData({...data, status: e.target.value})}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
      <div className="flex gap-4 items-center justify-end mt-4">
        <button 
          type="button" 
          className="px-4 py-1 rounded bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors" 
          onClick={onCancel}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="px-4 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors"
        >
          {type === "Add" ? "Add User" : "Update User"}
        </button>
      </div>
    </form>
  );
};

// Delete Modal
const DeleteUserModal = ({user, onSubmit, onCancel}) => (
  <div className="space-y-5">
    <div className="text-xl font-bold">Confirm Delete</div>
    <div>
      Are you sure you want to delete the user <span className="font-bold">{user.name}</span>? 
      This action cannot be undone.
    </div>
    <div className="flex gap-4 justify-end">
      <button 
        className="px-4 py-1 rounded bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors" 
        onClick={onCancel}
      >
        Cancel
      </button>
      <button 
        className="px-4 py-1 rounded bg-red-700 text-white hover:bg-red-800 transition-colors" 
        onClick={onSubmit}
      >
        Delete User
      </button>
    </div>
  </div>
);

export default UserManagement;