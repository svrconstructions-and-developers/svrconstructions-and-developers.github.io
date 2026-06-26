import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Client User
  const [loading, setLoading] = useState(true);

  // Initialize and check current user from JWT token
  useEffect(() => {
    const clientToken = sessionStorage.getItem('svr_client_token');
    const storedClientUser = sessionStorage.getItem('svr_client_user');

    if (clientToken && storedClientUser) {
      setUser(JSON.parse(storedClientUser));
      api.get('/api/auth/me', { headers: { Authorization: `Bearer ${clientToken}` } })
        .then((response) => {
          const freshUser = response.data;
          setUser(freshUser);
          sessionStorage.setItem('svr_client_user', JSON.stringify(freshUser));
        })
        .catch(() => {
          sessionStorage.removeItem('svr_client_token');
          sessionStorage.removeItem('svr_client_user');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Client Login
  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      sessionStorage.setItem('svr_client_token', token);
      sessionStorage.setItem('svr_client_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.error || 'Login failed. Please check your credentials.';
    }
  };

  // Client Register
  const register = async (name, email, password, phone, company) => {
    try {
      const response = await api.post('/api/auth/register', { name, email, password, phone, company });
      const { token, user: userData } = response.data;
      
      sessionStorage.setItem('svr_client_token', token);
      sessionStorage.setItem('svr_client_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.error || 'Registration failed.';
    }
  };

  // Client Logout
  const logout = () => {
    sessionStorage.removeItem('svr_client_token');
    sessionStorage.removeItem('svr_client_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
