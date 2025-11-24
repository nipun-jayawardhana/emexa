// frontend/src/services/user.service.js

import api from './apiClient';

// Existing services
export const userService = {
  login: (payload) => api.post('/auth/login', payload).then(r => r.data),
  me: () => api.get('/users/me').then(r => r.data),
};

// User Management CRUD functions
export const getAllUsers = () => api.get('/users').then(r => r.data);
export const addUser = (payload) => api.post('/users', payload).then(r => r.data);
export const updateUser = (id, payload) => api.put(`/users/${id}`, payload).then(r => r.data);
export const deleteUser = (id) => api.delete(`/users/${id}`).then(r => r.data);

export const getUsers = () => api.get('/users').then(r => r.data);
export const getUserById = (id) => api.get(`/users/${id}`).then(r => r.data);

// Teacher Approval functions
export const getTeacherApprovals = () => {
  return api.get('/users/teacher-approvals')  // ← REMOVE /api
    .then(r => r.data)
    .catch(err => {
      console.error('Error fetching teacher approvals:', err);
      return [];
    });
};

export const approveTeacher = (id) => {
  return api.put(`/users/teacher-approvals/${id}/approve`, {})
    .then(r => r.data)
    .catch(err => {
      throw err;
    });
};

export const rejectTeacher = (id) => {
  return api.put(`/users/teacher-approvals/${id}/reject`, {})
    .then(r => r.data)
    .catch(err => {
      throw err;
    });
};