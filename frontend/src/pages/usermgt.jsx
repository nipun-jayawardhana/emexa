// frontend/src/pages/usermgt.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUsers,
  updateUser,
  deleteUser,
  getTeacherApprovals,
  approveTeacher,
  rejectTeacher,
} from "../services/user.service";
import Modal from "react-modal";
import Header from "../components/headerorigin.jsx";

// Helper tag components for status and roles
const StatusTag = ({ status }) => (
  <span
    className={`px-3 py-1 rounded text-xs font-medium ${
      status === "Active"
        ? "bg-green-100 text-green-700"
        : status === "Inactive"
        ? "bg-red-100 text-red-700"
        : "bg-gray-100 text-gray-700"
    }`}
  >
    {status}
  </span>
);

const RoleTag = ({ role }) => (
  <span
    className={`px-3 py-1 rounded text-xs font-medium ${
      role === "Admin"
        ? "bg-purple-100 text-purple-700"
        : role === "Teacher"
        ? "bg-blue-100 text-blue-700"
        : role === "Student"
        ? "bg-green-100 text-green-700"
        : "bg-gray-100 text-gray-700"
    }`}
  >
    {role}
  </span>
);

const UserManagement = () => {
  const navigate = useNavigate();

  // Page state
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
  const dropdownRef = React.useRef(null);

  // Get admin user info
  useEffect(() => {
    const adminUserData = localStorage.getItem("adminUser");
    if (adminUserData) {
      setAdminUser(JSON.parse(adminUserData));
    }
  }, []);

  // Check admin authentication
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch users and approvals
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("📊 Fetching data...");

        // Fetch users
        let usersData = [];
        try {
          usersData = await getUsers();
          console.log("✅ Users data:", usersData);
        } catch (err) {
          console.error("❌ Error fetching users:", err);
        }

        // Fetch teacher approvals
        let teacherApprovalsData = [];
        try {
          teacherApprovalsData = await getTeacherApprovals();
          console.log("✅ Teacher approvals:", teacherApprovalsData);
        } catch (err) {
          console.error("❌ Error fetching teacher approvals:", err);
        }

        // Fetch student approvals
        let studentApprovalsData = [];
        try {
          const response = await fetch(
            "http://localhost:5000/api/auth/student-approvals"
          );
          if (response.ok) {
            studentApprovalsData = await response.json();
            console.log("✅ Student approvals:", studentApprovalsData);
          }
        } catch (err) {
          console.error("❌ Error fetching student approvals:", err);
        }

        // Ensure all data are arrays
        setUsers(Array.isArray(usersData) ? usersData : []);
        setTeacherApprovals(
          Array.isArray(teacherApprovalsData) ? teacherApprovalsData : []
        );
        setStudentApprovals(
          Array.isArray(studentApprovalsData) ? studentApprovalsData : []
        );

        console.log("✅ Final state:", {
          users: Array.isArray(usersData) ? usersData.length : 0,
          teachers: Array.isArray(teacherApprovalsData)
            ? teacherApprovalsData.length
            : 0,
          students: Array.isArray(studentApprovalsData)
            ? studentApprovalsData.length
            : 0,
        });
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setUsers([]);
        setTeacherApprovals([]);
        setStudentApprovals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const handleUpdateUser = (user) => {
    updateUser(user._id, user)
      .then((updatedUser) => {
        setUsers(
          users.map((u) => (u._id === updatedUser._id ? updatedUser : u))
        );
        closeModal();
      })
      .catch((err) => {
        console.error("Error updating user:", err);
        alert("Failed to update user. Please try again.");
      });
  };

  const handleDeleteUser = (id) => {
    deleteUser(id)
      .then(() => {
        setUsers(users.filter((u) => u._id !== id));
        closeModal();
      })
      .catch((err) => {
        console.error("Error deleting user:", err);
        alert("Failed to delete user. Please try again.");
      });
  };

  const handleApproveTeacher = (id) => {
    approveTeacher(id)
      .then(() => {
        setTeacherApprovals(
          teacherApprovals.map((appr) =>
            appr._id === id ? { ...appr, status: "Approved" } : appr
          )
        );
      })
      .catch((err) => {
        console.error("Error approving teacher:", err);
        alert("Failed to approve teacher. Please try again.");
      });
  };

  const handleRejectTeacher = (id) => {
    rejectTeacher(id)
      .then(() => {
        setTeacherApprovals(
          teacherApprovals.map((appr) =>
            appr._id === id ? { ...appr, status: "Rejected" } : appr
          )
        );
      })
      .catch((err) => {
        console.error("Error rejecting teacher:", err);
        alert("Failed to reject teacher. Please try again.");
      });
  };

  const handleApproveStudent = (id) => {
    fetch(`http://localhost:5000/api/auth/student-approvals/${id}/approve`, {
      method: "PUT",
    })
      .then(() => {
        setStudentApprovals(
          studentApprovals.map((appr) =>
            appr._id === id ? { ...appr, status: "Approved" } : appr
          )
        );
      })
      .catch((err) => {
        console.error("Error approving student:", err);
        alert("Failed to approve student. Please try again.");
      });
  };

  const handleRejectStudent = (id) => {
    fetch(`http://localhost:5000/api/auth/student-approvals/${id}/reject`, {
      method: "PUT",
    })
      .then(() => {
        setStudentApprovals(
          studentApprovals.map((appr) =>
            appr._id === id ? { ...appr, status: "Rejected" } : appr
          )
        );
      })
      .catch((err) => {
        console.error("Error rejecting student:", err);
        alert("Failed to reject student. Please try again.");
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/login");
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowRoleDropdown(false);
  };

  // Filtering - FIXED: Single role selection
  const filteredUsers = Array.isArray(users)
    ? users.filter((u) => {
        const matchesRole =
          selectedRole === "All Roles" || u.role === selectedRole;
        const matchesSearch =
          u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRole && matchesSearch;
      })
    : [];

  // FIXED: Added Array.isArray check
  const pendingTeacherApprovals = Array.isArray(teacherApprovals)
    ? teacherApprovals.filter((x) => !x.status).length
    : 0;
  const pendingStudentApprovals = Array.isArray(studentApprovals)
    ? studentApprovals.filter((x) => !x.status).length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Component */}
      <Header userName={adminUser?.name || "Admin"} userRole="admin" />

      <div className="flex pt-14">
        {/* Sidebar */}
        <aside className="w-64 bg-gradient-to-b from-green-100 to-green-200 min-h-[calc(100vh-56px)] p-6">
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-teal-700 bg-white rounded-lg font-medium text-sm shadow-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              User Management
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white hover:bg-opacity-50 rounded-lg font-medium text-sm transition-all">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Student Dashboard
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white hover:bg-opacity-50 rounded-lg font-medium text-sm transition-all">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Teacher Dashboard
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white hover:bg-opacity-50 rounded-lg font-medium text-sm transition-all">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Quizzes
            </button>

            <div className="pt-8 border-t border-green-300 mt-auto">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white hover:bg-opacity-50 rounded-lg font-medium text-sm transition-all mt-4"
              >
                <svg
                  className="w-5 h-5"
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
                Log Out
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                User Management Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Add, edit, and manage users in your quiz system
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-6 border-b border-gray-200 bg-white px-6 pt-4 rounded-t-lg">
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
                  tab === "teacher-approvals"
                    ? "text-teal-600 border-b-2 border-teal-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setTab("teacher-approvals")}
              >
                Teacher Approvals
                {pendingTeacherApprovals > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 text-xs font-medium">
                    {pendingTeacherApprovals}
                  </span>
                )}
              </button>
              <button
                className={`pb-3 font-medium text-sm relative ${
                  tab === "student-approvals"
                    ? "text-teal-600 border-b-2 border-teal-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setTab("student-approvals")}
              >
                Student Approvals
                {pendingStudentApprovals > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 text-xs font-medium">
                    {pendingStudentApprovals}
                  </span>
                )}
              </button>
            </div>

            {tab === "users" && (
              <div className="bg-white rounded-b-lg shadow-sm">
                {/* Toolbar */}
                <div className="p-6 border-b border-gray-200 flex items-center gap-3">
                  <input
                    type="text"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-80 text-sm"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <div className="relative" ref={dropdownRef}>
                    <button
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 min-w-[140px] justify-between text-sm"
                      onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    >
                      <span>{selectedRole}</span>
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {showRoleDropdown && (
                      <div className="absolute top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        {["All Roles", "Admin", "Teacher", "Student"].map(
                          (role) => (
                            <button
                              key={role}
                              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between text-sm first:rounded-t-lg last:rounded-b-lg"
                              onClick={() => handleRoleSelect(role)}
                            >
                              <span>{role}</span>
                              {selectedRole === role && (
                                <svg
                                  className="w-4 h-4 text-teal-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Date Added
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-12 text-center text-gray-500 text-sm"
                          >
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr
                            key={u._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {u.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {u.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <RoleTag role={u.role} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusTag status={u.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {u.dateAdded
                                ? new Date(u.dateAdded).toLocaleDateString()
                                : u.createdAt
                                ? new Date(u.createdAt).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                              <button
                                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                onClick={() => openModal("view", u)}
                              >
                                View
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800 font-medium transition-colors"
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

            {tab === "teacher-approvals" && (
              <div className="bg-white rounded-b-lg shadow-sm p-6">
                <ApprovalTab
                  approvals={teacherApprovals}
                  title="Teacher Approval Requests"
                  description="Review and approve teacher registration requests"
                  onApprove={handleApproveTeacher}
                  onReject={handleRejectTeacher}
                />
              </div>
            )}

            {tab === "student-approvals" && (
              <div className="bg-white rounded-b-lg shadow-sm p-6">
                <ApprovalTab
                  approvals={studentApprovals}
                  title="Student Approval Requests"
                  description="Review and approve student registration requests"
                  onApprove={handleApproveStudent}
                  onReject={handleRejectStudent}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        ariaHideApp={false}
      >
        {modalType === "view" && (
          <ViewUserModal user={selectedUser} onClose={closeModal} />
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

// Approval Tab Component
const ApprovalTab = ({
  approvals,
  title,
  description,
  onApprove,
  onReject,
}) => (
  <div>
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
    </div>

    {!Array.isArray(approvals) || approvals.length === 0 ? (
      <div className="border border-gray-200 rounded p-8 text-center">
        <p className="text-gray-500 text-sm">
          No approval requests at this time.
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {approvals.map((ap) => (
          <div
            key={ap._id}
            className="border border-gray-200 rounded p-6 bg-white"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {ap.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{ap.email}</p>
                <p className="text-xs text-gray-500 mb-3">
                  Requested on:{" "}
                  {ap.requestedOn
                    ? new Date(ap.requestedOn).toLocaleDateString()
                    : ap.createdAt
                    ? new Date(ap.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
                <div className="text-sm">
                  <span className="font-semibold text-gray-900">
                    Qualifications:
                  </span>
                  <p className="text-gray-700 mt-1">
                    {ap.qualifications || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                {!ap.status ? (
                  <>
                    <button
                      className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors font-medium text-sm flex items-center gap-2"
                      onClick={() => onApprove(ap._id)}
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Approve
                    </button>
                    <button
                      className="px-4 py-2 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm flex items-center gap-2"
                      onClick={() => onReject(ap._id)}
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Reject
                    </button>
                  </>
                ) : ap.status === "Approved" ? (
                  <span className="px-4 py-2 rounded bg-green-100 text-green-700 font-medium text-sm">
                    Approved
                  </span>
                ) : (
                  <span className="px-4 py-2 rounded bg-red-100 text-red-700 font-medium text-sm">
                    Rejected
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// View User Modal Component
const ViewUserModal = ({ user, onClose }) => (
  <div>
    <h2 className="text-lg font-semibold text-gray-900 mb-4">User Profile</h2>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <p className="text-sm text-gray-900">{user.name}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <p className="text-sm text-gray-900">{user.email}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <div className="mt-1">
          <RoleTag role={user.role} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <div className="mt-1">
          <StatusTag status={user.status} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date Added
        </label>
        <p className="text-sm text-gray-900">
          {user.dateAdded
            ? new Date(user.dateAdded).toLocaleDateString()
            : user.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : "N/A"}
        </p>
      </div>
    </div>

    <div className="flex gap-3 justify-end pt-6">
      <button
        className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors font-medium text-sm"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  </div>
);

// Delete Modal
const DeleteUserModal = ({ user, onSubmit, onCancel }) => (
  <div>
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h2>
    <p className="text-sm text-gray-600 mb-6">
      Are you sure you want to delete the user{" "}
      <span className="font-semibold text-gray-900">{user.name}</span>? This
      action cannot be undone.
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
