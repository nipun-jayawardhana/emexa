// frontend/src/pages/UserManagement.jsx

import React, { useEffect, useState } from "react";
import { getUsers, addUser, updateUser, deleteUser, getTeacherApprovals, approveTeacher, rejectTeacher } from "../services/user.service";
import Modal from "react-modal"; // or your modal of choice, install if not present
import { getAllUsers, addUser, updateUser, deleteUser } from '../services/user.service.js';


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

  // Fetch users and approvals
  useEffect(() => {
    getUsers().then(setUsers);
    getTeacherApprovals().then(setTeacherApprovals);
  }, []);

  // CRUD handlers
  const openModal = (type, user) => {
    setSelectedUser(user || null);
    setModalType(type);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false); setModalType(""); setSelectedUser(null);
  };

  const handleAddUser = (user) => {
    addUser(user).then(u => {
      setUsers([...users, u]);
      closeModal();
    });
  };
  const handleUpdateUser = (user) => {
    updateUser(user).then(u => {
      setUsers(users.map(us => us._id===u._id?u:us));
      closeModal();
    });
  };
  const handleDeleteUser = (id) => {
    deleteUser(id).then(() => {
      setUsers(users.filter(u => u._id !== id));
      closeModal();
    });
  };
  const handleApproveTeacher = (id) => {
    approveTeacher(id).then(() => {
      setTeacherApprovals(teacherApprovals.map(appr => appr._id === id ? {...appr, status:"Approved"} : appr));
    });
  };
  const handleRejectTeacher = (id) => {
    rejectTeacher(id).then(() => {
      setTeacherApprovals(teacherApprovals.map(appr => appr._id === id ? {...appr, status:"Rejected"} : appr));
    });
  };

  // Filtering and rendering
  const filteredUsers = users.filter(u => roleFilter[u.role]);
  return (
    <div className="p-6 user-management-page">
      <div className="mb-4 flex items-center justify-between border-b pb-2">
        <div className="text-2xl font-semibold">User Management</div>
        <div>
          <button
            className={`px-6 py-2 rounded bg-green-700 text-white`}
            onClick={() => openModal("add")}
          >
            + Add User
          </button>
        </div>
      </div>
      <div className="mb-4 flex gap-8">
        <button className={`px-6 py-1 font-bold ${tab==="users"?"border-b-2 border-green-700":""}`} onClick={()=>setTab("users")}>All Users</button>
        <button className={`px-6 py-1 font-bold ${tab==="approvals"?"border-b-2 border-green-700":""}`} onClick={()=>setTab("approvals")}>
          Teacher Approvals
          {teacherApprovals.filter(x=>!x.status).length > 0 && <span className="ml-1 px-2 py-0.5 rounded bg-green-700 text-white text-xs inline-block">{teacherApprovals.filter(x=>!x.status).length}</span>}
        </button>
      </div>
      {tab==="users" && (
        <div>
          {/* Role filter */}
          <div className="mb-2 flex gap-4">
            {["Admin","Teacher","Student"].map(role=>(
              <label key={role}>
                <input type="checkbox" checked={roleFilter[role]} onChange={()=>{
                  setRoleFilter({...roleFilter, [role]:!roleFilter[role]});
                }}/>
                <span className="ml-2">{role}</span>
              </label>
            ))}
            <input className="ml-auto px-3 py-1 border rounded" placeholder="Search…" onChange={e=>{
              // Optional: Add search functionality. Filter `users` by name/email here.
            }} />
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
              {filteredUsers.map(u => (
                <tr key={u._id} className="border-t">
                  <td className="p-2">{u.name}</td>
                  <td>{u.email}</td>
                  <td><RoleTag role={u.role}/></td>
                  <td><StatusTag status={u.status}/></td>
                  <td>{new Date(u.dateAdded).toLocaleDateString()}</td>
                  <td>
                    <button className="text-blue-700 mr-2 underline" onClick={()=>openModal("edit",u)}>Edit</button>
                    <button className="text-red-700 underline" onClick={()=>openModal("delete",u)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab==="approvals" && (
        <div>
          {teacherApprovals.map(ap => (
            <div key={ap._id} className={`mb-3 p-4 rounded border shadow bg-${ap.status==="Rejected"?"red":"green"}-50`}>
              <div className="font-semibold text-lg">{ap.name}</div>
              <div className="text-gray-700">{ap.email}</div>
              <div className="text-xs text-gray-500">Requested on: {new Date(ap.requestedOn).toLocaleDateString()}</div>
              <div className="text-sm mt-2"><span className="font-bold">Qualifications:</span> {ap.qualifications}</div>
              <div className="mt-2 flex gap-2">
                {!ap.status && (<>
                  <button className="px-4 py-1 rounded bg-green-700 text-white" onClick={()=>handleApproveTeacher(ap._id)}>Approve</button>
                  <button className="px-4 py-1 rounded bg-gray-300 text-gray-700" onClick={()=>handleRejectTeacher(ap._id)}>Reject</button>
                </>)}
                {ap.status==="Approved" && <span className="px-3 py-1 rounded bg-green-100 text-green-700">Approved</span>}
                {ap.status==="Rejected" && <span className="px-3 py-1 rounded bg-red-100 text-red-700">Rejected</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal: Add/Edit/Delete */}
      <Modal
        isOpen={modalOpen} onRequestClose={closeModal}
        className="bg-white border p-8 rounded shadow max-w-md mx-auto mt-32"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
      >
        {modalType==="add" && (
          <AddEditUserForm
            onSubmit={handleAddUser}
            onCancel={closeModal}
            type="Add"
          />
        )}
        {modalType==="edit" && (
          <AddEditUserForm
            user={selectedUser}
            onSubmit={handleUpdateUser}
            onCancel={closeModal}
            type="Edit"
          />
        )}
        {modalType==="delete" && (
          <DeleteUserModal user={selectedUser} onSubmit={()=>handleDeleteUser(selectedUser._id)} onCancel={closeModal}/>
        )}
      </Modal>
    </div>
  );
};

// Add/Edit User Modal Component
const AddEditUserForm = ({user, onSubmit, onCancel, type}) => {
  const [data, setData] = useState(user || {name:"", email:"", role:"Student", status:"Active"});
  return (
    <form className="space-y-4" onSubmit={e=>{e.preventDefault(); onSubmit(data);}}>
      <div className="text-xl font-bold mb-2">{type} User</div>
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input className="mt-1 border px-2 py-1 rounded w-full" required value={data.name} onChange={e=>setData({...data, name:e.target.value})}/>
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input className="mt-1 border px-2 py-1 rounded w-full" required type="email" value={data.email} onChange={e=>setData({...data, email:e.target.value})}/>
      </div>
      <div>
        <label className="block text-sm font-medium">Role</label>
        <select className="mt-1 border px-2 py-1 rounded w-full" required value={data.role} onChange={e=>setData({...data, role:e.target.value})}>
          <option value="Admin">Admin</option>
          <option value="Teacher">Teacher</option>
          <option value="Student">Student</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Status</label>
        <select className="mt-1 border px-2 py-1 rounded w-full" required value={data.status} onChange={e=>setData({...data, status:e.target.value})}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
      <div className="flex gap-4 items-center justify-end mt-4">
        <button type="button" className="px-4 py-1 rounded bg-gray-300 text-gray-700" onClick={onCancel}>Cancel</button>
        <button type="submit" className="px-4 py-1 rounded bg-green-700 text-white">{type === "Add" ? "Add User" : "Update User"}</button>
      </div>
    </form>
  );
};

// Delete Modal
const DeleteUserModal = ({user, onSubmit, onCancel}) => (
  <div className="space-y-5">
    <div className="text-xl font-bold">Confirm Delete</div>
    <div>Are you sure you want to delete the user <span className="font-bold">{user.name}</span>? This action cannot be undone.</div>
    <div className="flex gap-4 justify-end">
      <button className="px-4 py-1 rounded bg-gray-300 text-gray-700" onClick={onCancel}>Cancel</button>
      <button className="px-4 py-1 rounded bg-red-700 text-white" onClick={onSubmit}>Delete User</button>
    </div>
  </div>
);

export default UserManagement;
