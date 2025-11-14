// frontend/src/services/user.service.js

import api from './apiClient';

// Existing services (do NOT remove/modify)
export const userService = {
  login: (payload) => api.post('/auth/login', payload).then(r => r.data),
  me: () => api.get('/users/me').then(r => r.data),
};

// User Management CRUD functions
export const getAllUsers = () => api.get('/users').then(r => r.data);

export const addUser = (payload) => api.post('/users', payload).then(r => r.data);

export const updateUser = (id, payload) => api.put(`/users/${id}`, payload).then(r => r.data);

export const deleteUser = (id) => api.delete(`/users/${id}`).then(r => r.data);

// Additional functions for User Management page
export const getUsers = () => api.get('/users').then(r => r.data);

export const getUserById = (id) => api.get(`/users/${id}`).then(r => r.data);

// Teacher Approval functions (optional - implement backend endpoints if needed)
export const getTeacherApprovals = () => {
  return api.get('/users/teacher-approvals')
    .then(r => r.data)
    .catch(err => {
      console.warn('Teacher approvals endpoint not implemented yet');
      return []; // Return empty array if endpoint doesn't exist
    });
};

export const approveTeacher = (id) => {
  return api.put(`/users/teacher-approvals/${id}/approve`, {})
    .then(r => r.data)
    .catch(err => {
      console.error('Error approving teacher:', err);
      throw err;
    });
};

export const rejectTeacher = (id) => {
  return api.put(`/users/teacher-approvals/${id}/reject`, {})
    .then(r => r.data)
    .catch(err => {
      console.error('Error rejecting teacher:', err);
      throw err;
    });
};