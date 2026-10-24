import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Login } from './pages/Login';
import { StudentDashboard } from './pages/StudentDashboard';
import { ComingSoon } from './pages/ComingSoon';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Page 1: Login */}
          <Route path="/" element={<Login />} />

          {/* Page 2: Student Dashboard (Protected by client-side auth check) */}
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Placeholder for Admin & Recruiter */}
          <Route path="/coming-soon" element={<ComingSoon />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
