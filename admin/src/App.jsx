import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Security routes
import AdminRoute from './components/AdminRoute';

// Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const basename = window.location.pathname.startsWith('/SVR-Constructions-and-Developers')
  ? '/SVR-Constructions-and-Developers/admin'
  : '/admin';

export default function App() {
  return (
    <AuthProvider>
      <Router basename={basename}>
        <Routes>
          {/* Admin Login */}
          <Route path="/login" element={<AdminLogin />} />

          {/* Admin Portal Dashboard - Protected */}
          <Route 
            path="/" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />

          {/* Catch-all redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
