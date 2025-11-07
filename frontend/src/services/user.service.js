// src/services/user.service.js
import api from './apiClient';

export const userService = {
  login: (payload) => api.post('/auth/login', payload).then(r => r.data),
  me: () => api.get('/users/me').then(r => r.data),
};
