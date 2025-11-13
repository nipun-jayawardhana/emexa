import api from './apiClient';

// Existing services (do NOT remove/modify)
export const userService = {
  login: (payload) => api.post('/auth/login', payload).then(r => r.data),
  me: () => api.get('/users/me').then(r => r.data),
};

// ADD BELOW: User Management CRUD functions
export const getAllUsers = () => api.get('/users').then(r => r.data);

export const addUser = (payload) => api.post('/users', payload).then(r => r.data);

export const updateUser = (id, payload) => api.put(`/users/${id}`, payload).then(r => r.data);

export const deleteUser = (id) => api.delete(`/users/${id}`).then(r => r.data);
