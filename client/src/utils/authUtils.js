// Authentication utility functions

export const clearAuthData = () => {
  localStorage.removeItem('token');
  // Clear any other auth-related data
  sessionStorage.clear();
};

export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    // Basic token validation - check if it's a JWT format
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode the payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Date.now() / 1000;
    
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const getStoredToken = () => {
  const token = localStorage.getItem('token');
  if (token && isTokenValid(token)) {
    return token;
  }
  
  // Clear invalid token
  clearAuthData();
  return null;
};
