// frontend/src/services/apiClient.js
const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  try {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (err) {
    return {};
  }
};

const apiClient = {
  get: async (endpoint) => {
    const headers = { ...getAuthHeader() };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    return data;
  },

  post: async (endpoint, body) => {
    const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    return data;
  },

  put: async (endpoint, body) => {
    const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    return data;
  },

  delete: async (endpoint) => {
    const headers = { ...getAuthHeader() };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE', headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    return data;
  },
};

export default apiClient;