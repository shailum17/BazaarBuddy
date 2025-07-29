import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Fixed: Don't use hard redirect, let components handle navigation
      // window.location.href = '/login';
      
      // Dispatch custom event for auth failure
      window.dispatchEvent(new CustomEvent('auth:unauthorized', {
        detail: { message: 'Session expired. Please login again.' }
      }));
    }
    return Promise.reject(error);
  }
);

export default api; 