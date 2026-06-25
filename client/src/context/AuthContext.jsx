import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Client User
  const [adminUser, setAdminUser] = useState(null); // Admin User
  const [loading, setLoading] = useState(true);

  // Initialize and check current user from JWT token
  useEffect(() => {
    const clientToken = sessionStorage.getItem('svr_client_token');
    const storedClientUser = sessionStorage.getItem('svr_client_user');
    const adminToken = sessionStorage.getItem('svr_admin_token');
    const storedAdminUser = sessionStorage.getItem('svr_admin_user');

    const promises = [];

    if (clientToken && storedClientUser) {
      setUser(JSON.parse(storedClientUser));
      promises.push(
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
      );
    }

    if (adminToken && storedAdminUser) {
      setAdminUser(JSON.parse(storedAdminUser));
      promises.push(
        api.get('/api/auth/me', { headers: { Authorization: `Bearer ${adminToken}` } })
          .then((response) => {
            const freshAdmin = response.data;
            setAdminUser(freshAdmin);
            sessionStorage.setItem('svr_admin_user', JSON.stringify(freshAdmin));
          })
          .catch(() => {
            sessionStorage.removeItem('svr_admin_token');
            sessionStorage.removeItem('svr_admin_user');
            setAdminUser(null);
          })
      );
    }

    if (promises.length > 0) {
      Promise.all(promises).finally(() => {
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

  // Admin Login
  const adminLogin = async (usernameOrEmail, password) => {
    try {
      const response = await api.post('/api/auth/admin/login', { usernameOrEmail, password });
      const { token, user: userData } = response.data;
      
      sessionStorage.setItem('svr_admin_token', token);
      sessionStorage.setItem('svr_admin_user', JSON.stringify(userData));
      setAdminUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.error || 'Admin authentication failed.';
    }
  };

  // Client Logout
  const logout = () => {
    sessionStorage.removeItem('svr_client_token');
    sessionStorage.removeItem('svr_client_user');
    setUser(null);
  };

  // Admin Logout
  const adminLogout = () => {
    sessionStorage.removeItem('svr_admin_token');
    sessionStorage.removeItem('svr_admin_user');
    setAdminUser(null);
  };

  const value = {
    user,
    adminUser,
    loading,
    login,
    register,
    adminLogin,
    logout,
    adminLogout,
    isAuthenticated: !!user,
    isAdminAuthenticated: !!adminUser,
    isAdmin: adminUser && (adminUser.role === 'admin' || adminUser.role === 'super_admin'),
    isSuperAdmin: adminUser && adminUser.role === 'super_admin'
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
