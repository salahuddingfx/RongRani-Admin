import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState('guest'); // 'guest', 'user', 'admin'

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await axios.get('/api/users/profile');
      const userData = response.data;
      setUser(userData);
      setIsAuthenticated(true);
      setRole(userData.role || 'user');
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      setRole('guest');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await checkAuthStatus();
      } else {
        setRole('guest');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    const { token, ...userData } = response.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    setIsAuthenticated(true);
    setRole(userData.role || 'user');
    return userData;
  };

  const register = async (userData) => {
    const response = await axios.post('/api/auth/register', userData);
    const { token, ...user } = response.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    setIsAuthenticated(true);
    setRole(user.role || 'user');
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setRole('guest');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    role,
    login,
    register,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};