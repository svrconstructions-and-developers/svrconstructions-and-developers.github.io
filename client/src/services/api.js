import axios from 'axios';

// Create axios instance with API base path
const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically insert JWT token
api.interceptors.request.use(
  (config) => {
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    const token = sessionStorage.getItem(isAdminRoute ? 'svr_admin_token' : 'svr_client_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authorization expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const isAuthRoute = window.location.pathname.includes('/login') || window.location.pathname.includes('/admin/login');
      if (!isAuthRoute) {
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        if (isAdminRoute) {
          sessionStorage.removeItem('svr_admin_token');
          sessionStorage.removeItem('svr_admin_user');
          window.location.href = '/admin/login?expired=true';
        } else {
          sessionStorage.removeItem('svr_client_token');
          sessionStorage.removeItem('svr_client_user');
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
