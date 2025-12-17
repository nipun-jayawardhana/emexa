// frontend/src/services/user.service.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('adminToken') || localStorage.getItem('token');
};

// Get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
};

// Get all users (approved students, teachers, admins)
export const getUsers = async () => {
  try {
    console.log('🌐 Calling GET /api/users...');
    const response = await axios.get(`${API_URL}/users`, {
      headers: getAuthHeaders(),
      withCredentials: true
    });
    
    console.log('📥 Response from /api/users:', response.data);
    
    // Backend returns: { users: [...], students: [...], teachers: [...], admins: [...], total: number }
    // We need to extract the 'users' array
    if (response.data && response.data.users) {
      console.log('✅ Returning users array:', response.data.users.length);
      return response.data.users;
    } else if (Array.isArray(response.data)) {
      console.log('✅ Response is already an array:', response.data.length);
      return response.data;
    } else {
      console.warn('⚠️ Unexpected response structure:', response.data);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching users:', error.response?.data || error.message);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/users/${id}`, {
      headers: getAuthHeaders(),
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching user:', error.response?.data || error.message);
    throw error;
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    console.log('🗑️ Deleting user:', id);
    const response = await axios.delete(`${API_URL}/users/${id}`, {
      headers: getAuthHeaders(),
      withCredentials: true
    });
    console.log('✅ User deleted successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting user:', error.response?.data || error.message);
    throw error;
  }
};

// Update user
export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(`${API_URL}/users/${id}`, userData, {
      headers: getAuthHeaders(),
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error updating user:', error.response?.data || error.message);
    throw error;
  }
};

export default {
  getUsers,
  getUserById,
  deleteUser,
  updateUser
};