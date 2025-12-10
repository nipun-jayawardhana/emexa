// frontend/src/services/apiClient.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

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
    console.log('🌐 API GET:', `${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    console.log('📥 API Response:', response.status, data);

    if (!response.ok) {
      console.error('❌ API Error:', response.status, data);
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    return data;
  },

  post: async (endpoint, body) => {
    console.log('🌐 API POST:', `${API_BASE_URL}${endpoint}`, body);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    const data = await response.json();
    console.log('📥 API Response:', response.status, data);

    if (!response.ok) {
      console.error('❌ API Error:', response.status, data);
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    return data;
  },

  put: async (endpoint, body) => {
    const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    return data;
  },

  delete: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { 
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    return data;
  },
};

export default apiClient;