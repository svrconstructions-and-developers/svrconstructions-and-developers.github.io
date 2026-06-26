import axios from 'axios';

// Create axios instance with API base path
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically insert JWT token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('svr_client_token');
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
      const isAuthRoute = window.location.pathname.includes('/login');
      if (!isAuthRoute) {
        sessionStorage.removeItem('svr_client_token');
        sessionStorage.removeItem('svr_client_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
