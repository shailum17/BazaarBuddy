import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import socketService from '../services/socketService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }

    // Fixed: Listen for auth unauthorized events
    const handleAuthUnauthorized = (event) => {
      setUser(null);
      setLoading(false);
      toast.error(event.detail.message || 'Session expired. Please login again.');
      navigate('/login');
    };

    window.addEventListener('auth:unauthorized', handleAuthUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleAuthUnauthorized);
    };
  }, [navigate]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Fetch user error:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      // Fixed: Don't automatically redirect, let the event handler do it
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginData) => {
    try {
      const response = await api.post('/auth/login', loginData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      // Connect to socket
      socketService.connect(token);
      socketService.joinUser(user._id);
      
      toast.success('Login successful!');
      
      // Redirect based on role
      if (user.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else if (user.role === 'supplier') {
        navigate('/supplier/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.status === 423) {
        toast.error('Account locked due to too many failed attempts. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      // Connect to socket
      socketService.connect(token);
      socketService.joinUser(user._id);
      
      toast.success('Registration successful!');
      
      // Redirect based on role
      if (user.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else if (user.role === 'supplier') {
        navigate('/supplier/dashboard');
      }
      
      return true;
    } catch (error) {
      console.error('Registration error in AuthContext:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    
    // Disconnect socket
    socketService.disconnect();
    
    navigate('/');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      setUser(response.data.user);
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Profile update failed');
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isVendor: user?.role === 'vendor',
    isSupplier: user?.role === 'supplier',
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 