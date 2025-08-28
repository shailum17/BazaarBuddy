import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increased timeout for OTP operations which might take longer
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error details for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Dispatch custom event for auth failure
      window.dispatchEvent(new CustomEvent('auth:unauthorized', {
        detail: { message: 'Session expired. Please login again.' }
      }));
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server might be down');
    } else if (!error.response) {
      console.error('Network error - check if backend is running');
    }
    
    return Promise.reject(error);
  }
);

export default api;