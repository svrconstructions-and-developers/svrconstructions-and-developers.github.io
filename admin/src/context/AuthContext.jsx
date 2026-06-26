import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null); // Admin User
  const [loading, setLoading] = useState(true);

  // Initialize and check current user from JWT token
  useEffect(() => {
    const adminToken = sessionStorage.getItem('svr_admin_token');
    const storedAdminUser = sessionStorage.getItem('svr_admin_user');

    if (adminToken && storedAdminUser) {
      setAdminUser(JSON.parse(storedAdminUser));
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
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

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

  // Admin Logout
  const adminLogout = () => {
    sessionStorage.removeItem('svr_admin_token');
    sessionStorage.removeItem('svr_admin_user');
    setAdminUser(null);
  };

  const value = {
    adminUser,
    loading,
    adminLogin,
    adminLogout,
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
