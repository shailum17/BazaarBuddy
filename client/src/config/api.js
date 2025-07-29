// API Configuration for different environments
const getApiBaseUrl = () => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    // In development, use the proxy
    return '/api';
  }
  
  // In production, use the environment variable or fallback
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    // Remove trailing slash if present
    const cleanUrl = apiUrl.replace(/\/$/, '');
    return `${cleanUrl}/api`;
  }
  
  // Fallback for production (you should set this in your deployment)
  console.warn('VITE_API_URL not set, using fallback URL');
  return 'https://your-backend-domain.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Log the API URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
  console.log('Environment:', import.meta.env.MODE);
} 